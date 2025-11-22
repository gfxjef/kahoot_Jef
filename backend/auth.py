from flask import Blueprint, request, jsonify
from extensions import db
from models import User
from flask_jwt_extended import create_access_token
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('usuario')
    password = data.get('pass')

    if not username or not password:
        return jsonify({"msg": "Faltan datos"}), 400

    # Query User
    user = User.query.filter_by(usuario=username).first()

    if user and user.check_password(password):
        # Create JWT Token
        # Expires in 1 day for convenience
        expires = datetime.timedelta(days=1)
        access_token = create_access_token(identity=user.id, additional_claims={"nombre": user.nombre}, expires_delta=expires)
        
        return jsonify({
            "msg": "Login exitoso",
            "token": access_token,
            "user": {
                "id": user.id,
                "nombre": user.nombre,
                "usuario": user.usuario,
                "rango": user.rango
            }
        }), 200
    else:
        return jsonify({"msg": "Credenciales inválidas"}), 401
