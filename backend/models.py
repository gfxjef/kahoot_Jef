from extensions import db
import random
import string

from datetime import datetime

class Game(db.Model):
    __tablename__ = 'Kahoo_games'
    id = db.Column(db.Integer, primary_key=True)
    pin = db.Column(db.String(10), unique=True, nullable=False)
    title = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), default='PREPARED') # PREPARED, ACTIVE, FINISHED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    finished_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    players = db.relationship('Player', backref='game', lazy=True)
    questions = db.relationship('Question', backref='game', lazy=True)
    answers = db.relationship('Answer', backref='game', lazy=True)

    @staticmethod
    def generate_pin():
        return ''.join(random.choices(string.digits, k=6))

class Player(db.Model):
    __tablename__ = 'Kahoo_players'
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('Kahoo_games.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    final_score = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    answers = db.relationship('Answer', backref='player', lazy=True)

class Answer(db.Model):
    __tablename__ = 'Kahoo_answers'
    id = db.Column(db.BigInteger, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('Kahoo_games.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('Kahoo_players.id'), nullable=False)
    question_index = db.Column(db.Integer, nullable=False)
    option_index = db.Column(db.Integer, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    answered_at = db.Column(db.DateTime, default=datetime.utcnow)

class Question(db.Model):
    __tablename__ = 'Kahoo_questions'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    options = db.Column(db.JSON, nullable=False)
    correct_option_index = db.Column(db.Integer, nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('Kahoo_games.id'), nullable=False)

class User(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column('pass', db.String(255), nullable=False) # Mapped to 'pass' column
    nombre = db.Column(db.String(255), nullable=True)
    rango = db.Column(db.String(50), default='player') # 'admin' or 'player'

    def check_password(self, password):
        # Simple comparison as requested for speed/legacy support. 
        # In production, use werkzeug.security.check_password_hash
        return self.password == password
