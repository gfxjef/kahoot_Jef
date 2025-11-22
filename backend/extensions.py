from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS
import redis

db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins="*")
cors = CORS()

import os

# Initialize Redis here to avoid circular import issues
# Use a default or env var if needed
try:
    redis_host = os.getenv('REDIS_HOST', 'localhost')
    redis_port = int(os.getenv('REDIS_PORT', 6379))
    redis_password = os.getenv('REDIS_PASSWORD', None)
    
    redis_client = redis.Redis(
        host=redis_host, 
        port=redis_port, 
        password=redis_password,
        ssl=True if redis_password else False, # Upstash usually requires SSL
        db=0, 
        decode_responses=True
    )
except Exception as e:
    print(f"Redis connection failed: {e}")
    redis_client = None


