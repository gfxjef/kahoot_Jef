from flask import request
from flask_socketio import emit, join_room
from extensions import socketio, db, redis_client
from models import Game, Player, Question, Answer
import time

@socketio.on('join_game')
def handle_join_game(data):
    pin = data.get('pin')
    nickname = data.get('nickname')
    
    # Check Redis for game state
    if not redis_client.exists(f"game:{pin}"):
        emit('error', {'message': 'Game not found or inactive'})
        return

    # Get Game ID from MySQL (needed for Player creation)
    game = Game.query.filter_by(pin=pin).first()
    if not game:
        emit('error', {'message': 'Game record missing'})
        return

    if game.status != 'ACTIVE' and nickname != 'ADMIN':
        emit('error', {'message': 'Game is not active yet'})
        return

    join_room(pin)

    # Special handling for Admin/Host Display
    if nickname in ['ADMIN', 'HOST_DISPLAY']:
        if nickname == 'ADMIN':
            join_room(f"admin_{pin}")
            
        # Sync existing players to this admin/host
        all_players = redis_client.hgetall(f"game:{pin}:players")
        for pid, name in all_players.items():
            emit('player_joined', {'nickname': name, 'id': pid}, to=request.sid)
            
        return # Stop here, don't create a player record for Admin/Host

    # Create Player in MySQL
    player = Player(name=nickname, game_id=game.id) 
    db.session.add(player)
    db.session.commit()

    # Add to Redis
    redis_client.hset(f"game:{pin}:players", player.id, nickname)
    redis_client.hset(f"game:{pin}:scores", player.id, 0)

    emit('player_joined', {'nickname': nickname, 'id': player.id}, room=pin)
    emit('joined_success', {'game_id': game.id, 'player_id': player.id})
    
    # Optimization 2: Sync State for late joiners
    # If the game is already in progress (has a question index), send the current question
    current_index = redis_client.hget(f"game:{pin}", "current_question_index")
    if current_index is not None:
        current_index = int(current_index)
        # Fetch question data (We need to query MySQL again here for the sync, 
        # or better, cache the current question text in Redis too? 
        # For now, query MySQL to keep it simple and robust)
        questions = Question.query.filter_by(game_id=game.id).all()
        if 0 <= current_index < len(questions):
            question = questions[current_index]
            question_data = {
                'text': question.text,
                'options': question.options,
                'index': current_index
            }
            emit('new_question', question_data, to=request.sid)

@socketio.on('start_game')
def handle_start_game(data):
    pin = data.get('pin')
    if redis_client.exists(f"game:{pin}"):
        # Reset index if needed or ensure it starts at -1? 
        # handle_next_question increments, so if we want 0, we start at -1.
        # But let's assume handle_next_question handles the flow.
        emit('game_started', room=pin)
        handle_next_question(data)

@socketio.on('next_question')
def handle_next_question(data):
    pin = data.get('pin')
    
    # Increment question index in Redis
    current_index = redis_client.hincrby(f"game:{pin}", "current_question_index", 1)
    
    # Get questions from MySQL
    game = Game.query.filter_by(pin=pin).first()
    if not game:
        return

    questions = Question.query.filter_by(game_id=game.id).all()
    
    if current_index < len(questions):
        question = questions[current_index]
        
        # Cache correct answer in Redis for quick validation
        redis_client.hset(f"game:{pin}:correct_answers", current_index, question.correct_option_index)
        
        # Set start time for scoring
        redis_client.hset(f"game:{pin}", "question_start_time", time.time())
        
        question_data = {
            'text': question.text,
            'options': question.options,
            'index': current_index
        }
        emit('new_question', question_data, room=pin)
    else:
        # Game Over
        redis_client.hset(f"game:{pin}", "is_active", 0)
        emit('game_over', room=pin)
        # Here we could dump scores to MySQL

@socketio.on('submit_answer')
def handle_submit_answer(data):
    print(f"DEBUG: Raw submit_answer data: {data}")
    player_id = data.get('player_id')
    answer_index = data.get('answer_index')
    pin = data.get('pin') 
    client_q_index = data.get('question_index') # Optimization 3: Client sends index
    
    if not pin:
        print("ERROR: Missing PIN in submit_answer")
        emit('error', {'message': 'Missing game PIN. Please rejoin.'})
        return

    # Use Pipeline to reduce round-trips
    pipe = redis_client.pipeline()
    
    # 1. Get current question index
    pipe.hget(f"game:{pin}", "current_question_index")
    
    results = pipe.execute()
    current_index = int(results[0])
    
    # Optimization 3: Validate Index
    # If client is answering an old question (lag), ignore it.
    print(f"DEBUG: Client Index: {client_q_index} ({type(client_q_index)}), Server Index: {current_index} ({type(current_index)})")
    
    if client_q_index is not None:
        try:
            if int(client_q_index) != int(current_index):
                emit('error', {'message': f'Too late! Client: {client_q_index}, Server: {current_index}'}) 
                return
        except ValueError:
            print(f"Error converting indices to int: {client_q_index}, {current_index}")
            return

    # 2. Store answer and Get Correct Answer (Pipeline)
    pipe = redis_client.pipeline()
    # Use str(player_id) to be safe, though Redis handles ints
    pipe.hset(f"game:{pin}:answers:{current_index}", str(player_id), answer_index)
    pipe.hget(f"game:{pin}:correct_answers", current_index)
    pipe.hget(f"game:{pin}", "question_start_time") # Get start time
    
    results = pipe.execute()
    # results[0] is the hset result (ignored)
    correct_option_index = int(results[1]) if results[1] is not None else -1
    start_time = float(results[2]) if results[2] else time.time()
    
    print(f"DEBUG: Answer: {answer_index}, Correct: {correct_option_index}")
    
    is_correct = (int(answer_index) == correct_option_index)
    current_score = 0
    points_awarded = 0

    if is_correct:
        elapsed = time.time() - start_time
        if elapsed <= 2:
            points_awarded = 150
        elif elapsed <= 5:
            points_awarded = 100
        elif elapsed <= 10:
            points_awarded = 50
        else:
            points_awarded = 0 # Too slow!
        
        print(f"DEBUG: Correct! Elapsed: {elapsed:.2f}s, Points: {points_awarded}")
    
    # 3. Update Score (if correct) and Get Player Score (Pipeline)
    pipe = redis_client.pipeline()
    if is_correct and points_awarded > 0:
        pipe.hincrby(f"game:{pin}:scores", str(player_id), points_awarded)
    else:
        pipe.hget(f"game:{pin}:scores", str(player_id))
        
    results = pipe.execute()
    current_score = int(results[0]) if results[0] else 0
        
    emit('answer_result', {
        'correct': is_correct,
        'score': current_score,
        'points_added': points_awarded # Optional: show how many points they got
    }, to=request.sid)

    # 4. Fetch Leaderboard (Pipeline)
    pipe = redis_client.pipeline()
    pipe.hgetall(f"game:{pin}:scores")
    pipe.hgetall(f"game:{pin}:players")
    
    results = pipe.execute()
    all_scores = results[0]
    all_names = results[1]
    
    leaderboard = []
    print(f"DEBUG: Scores: {all_scores}, Names: {all_names}")
    for pid, score in all_scores.items():
        name = all_names.get(pid, "Unknown")
        leaderboard.append({'nickname': name, 'score': int(score)})
    
    leaderboard.sort(key=lambda x: x['score'], reverse=True)
    
    # Send Leaderboard to EVERYONE for now to avoid confusion
    emit('update_leaderboard', leaderboard, room=pin)

