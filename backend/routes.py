from flask import Blueprint, jsonify, request
from extensions import db
from models import Game, Question

main = Blueprint('main', __name__)

@main.route('/create_game', methods=['POST'])
def create_game():
    pin = Game.generate_pin()
    game = Game(pin=pin)
    db.session.add(game)
    db.session.commit()

    # No seeded questions anymore, admin adds them manually
    
    return jsonify({'pin': pin, 'game_id': game.id})

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
