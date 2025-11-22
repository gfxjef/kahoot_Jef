from flask import Flask
from extensions import db, socketio, cors
from routes import main
import events # Import to register events
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Database Configuration (MySQL)
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_name = os.getenv("DB_NAME")
    db_port = os.getenv("DB_PORT", 3306)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_secret_for_dev_only')
    
    # Initialize Extensions
    db.init_app(app)
    cors.init_app(app)
    socketio.init_app(app)
    
    from flask_jwt_extended import JWTManager
    jwt = JWTManager(app)
    
    from auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(main, url_prefix='/api')
    
    # Note: tables are created via db_init.py, so we don't need db.create_all() here necessarily,
    # but it doesn't hurt to keep it if models match.
    # with app.app_context():
    #     db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    socketio.run(app, debug=True, port=5000)
