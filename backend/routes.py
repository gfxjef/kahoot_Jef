from flask import Blueprint, jsonify, request
from datetime import datetime
from extensions import db, redis_client
from models import Game, Question

main = Blueprint('main', __name__)

@main.route('/create_game', methods=['POST'])
def create_game():
    data = request.json or {}
    title = data.get('title', 'Untitled Game')
    
    pin = Game.generate_pin()
    game = Game(pin=pin, title=title, status='PREPARED')
    db.session.add(game)
    db.session.commit()

    # Initialize Redis state (optional for PREPARED, but good for consistency)
    if redis_client:
        redis_client.hset(f"game:{pin}", mapping={
            "pin": pin,
            "current_question_index": -1,
            "is_active": 0 # Not active yet
        })
        redis_client.expire(f"game:{pin}", 86400) # 24 hours

    return jsonify({'pin': pin, 'game_id': game.id, 'title': title, 'status': 'PREPARED'})

@main.route('/games', methods=['GET'])
def list_games():
    games = Game.query.order_by(Game.created_at.desc()).all()
    return jsonify([{
        'id': g.id,
        'pin': g.pin,
        'title': g.title,
        'status': g.status,
        'created_at': g.created_at.isoformat() if g.created_at else None
    } for g in games])

@main.route('/game/<int:game_id>/status', methods=['PUT'])
def update_game_status(game_id):
    data = request.json
    new_status = data.get('status')
    
    game = Game.query.get_or_404(game_id)
    game.status = new_status
    
    if new_status == 'ACTIVE':
        # Ensure Redis is ready
        if redis_client:
            redis_client.hset(f"game:{game.pin}", "is_active", 1)
            
    elif new_status == 'FINISHED':
        game.finished_at = datetime.utcnow()
        if redis_client:
            redis_client.hset(f"game:{game.pin}", "is_active", 0)
            
    db.session.commit()
    return jsonify({'message': 'Status updated', 'status': new_status})

@main.route('/state/<pin>', methods=['GET'])
def get_game_state(pin):
    # Check MySQL first for status
    game = Game.query.filter_by(pin=pin).first()
    if not game:
         return jsonify({'error': 'Game not found'}), 404
         
    if redis_client and redis_client.exists(f"game:{pin}"):
        state = redis_client.hgetall(f"game:{pin}")
        return jsonify(state)
    
    return jsonify({'pin': pin, 'status': game.status})


@main.route('/add_question', methods=['POST'])
def add_question():
    data = request.json
    game_id = data.get('game_id')
    text = data.get('text')
    options = data.get('options')
    correct_index = data.get('correct_index')
    
    question = Question(text=text, options=options, correct_option_index=correct_index, game_id=game_id)
    db.session.add(question)
    db.session.commit()
    
    return jsonify({'message': 'Question added'})
