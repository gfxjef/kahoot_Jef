from extensions import db
import random
import string

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pin = db.Column(db.String(6), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    current_question_index = db.Column(db.Integer, default=-1)
    players = db.relationship('Player', backref='game', lazy=True)
    questions = db.relationship('Question', backref='game', lazy=True)

    @staticmethod
    def generate_pin():
        return ''.join(random.choices(string.digits, k=6))

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, default=0)
    sid = db.Column(db.String(100))  # Socket ID
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    options = db.Column(db.JSON, nullable=False) # List of strings
    correct_option_index = db.Column(db.Integer, nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
