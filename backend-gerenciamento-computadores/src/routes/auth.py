from flask import Blueprint, request, jsonify
import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
import os

from ..models.computador import db, User

auth_bp = Blueprint('auth', __name__)

# Chave secreta para JWT (em produção, use uma variável de ambiente)
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'sua-chave-secreta-aqui')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token não fornecido'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'Usuário não encontrado'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'message': 'Usuário e senha são obrigatórios'}), 400
        
        # Buscar usuário no banco
        user = User.query.filter_by(username=username).first()
        
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'message': 'Credenciais inválidas'}), 401
        
        if not user.active:
            return jsonify({'message': 'Usuário desativado'}), 401
        
        # Gerar token JWT
        token = jwt.encode({
            'user_id': user.id,
            'username': user.username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/verify', methods=['GET'])
@token_required
def verify_token(current_user):
    return jsonify({
        'message': 'Token válido',
        'user': current_user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    # Com JWT, o logout é feito no frontend removendo o token
    return jsonify({'message': 'Logout realizado com sucesso'}), 200

def init_admin_user():
    """Inicializa o usuário administrador padrão"""
    try:
       
        
        # Verificar se já existe um usuário admin
        admin_user = User.query.filter_by(username='admin').first()
        
        
        if not admin_user:
            print("Criando usuário admin...")
            # Criar usuário admin padrão
            password_hash = bcrypt.hashpw('sgcpgm@2025'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            
            admin_user = User(
                username='admin',
                password_hash=password_hash,
                active=True
            )
            db.session.add(admin_user)
            db.session.commit()
               
    except Exception as e:
 
        import traceback
        traceback.print_exc()
        db.session.rollback()