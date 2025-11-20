from flask import request
from flask_socketio import emit, join_room
from extensions import socketio, db
from models import Game, Player, Question

@socketio.on('join_game')
def handle_join_game(data):
    pin = data.get('pin')
    nickname = data.get('nickname')
    
    game = Game.query.filter_by(pin=pin).first()
    if not game or not game.is_active:
        emit('error', {'message': 'Game not found or inactive'})
        return

    player = Player(nickname=nickname, game_id=game.id, sid=request.sid)
    db.session.add(player)
    db.session.commit()

    join_room(pin)
    emit('player_joined', {'nickname': nickname, 'id': player.id}, room=pin)
    emit('joined_success', {'game_id': game.id, 'player_id': player.id})

@socketio.on('start_game')
def handle_start_game(data):
    pin = data.get('pin')
    game = Game.query.filter_by(pin=pin).first()
    if game:
        emit('game_started', room=pin)
        # Automatically send the first question
        handle_next_question(data)

@socketio.on('next_question')
def handle_next_question(data):
    pin = data.get('pin')
    game = Game.query.filter_by(pin=pin).first()
    
    if game:
        game.current_question_index += 1
        db.session.commit()
        
        if game.current_question_index < len(game.questions):
            question = game.questions[game.current_question_index]
            question_data = {
                'text': question.text,
                'options': question.options,
                'index': game.current_question_index
            }
            emit('new_question', question_data, room=pin)
        else:
            emit('game_over', room=pin)

@socketio.on('submit_answer')
def handle_submit_answer(data):
    player_id = data.get('player_id')
    answer_index = data.get('answer_index')
    
    player = Player.query.get(player_id)
    if player:
        game = Game.query.get(player.game_id)
        current_q = game.questions[game.current_question_index]
        
        if answer_index == current_q.correct_option_index:
            player.score += 100  # Simplified scoring
            db.session.commit()
            
        emit('answer_result', {
            'correct': answer_index == current_q.correct_option_index,
            'score': player.score
        }, to=request.sid)

        # Broadcast live scores to admin (room=pin)
        # Get all players for this game
        players = Player.query.filter_by(game_id=game.id).order_by(Player.score.desc()).all()
        leaderboard = [{'nickname': p.nickname, 'score': p.score} for p in players]
        emit('update_leaderboard', leaderboard, room=game.pin)
