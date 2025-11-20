from flask import Flask
from extensions import db, socketio, cors
from routes import main
import events # Import to register events

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kahoot.db'
    app.config['SECRET_KEY'] = 'secret!'
    
    db.init_app(app)
    cors.init_app(app)
    socketio.init_app(app)
    
    app.register_blueprint(main, url_prefix='/api')
    
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    socketio.run(app, debug=True, port=5000)
