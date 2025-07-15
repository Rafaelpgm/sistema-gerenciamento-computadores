# /backend-gerenciamento-computadores/src/main.py (VERSÃO MODIFICADA)

import os
import sys
import time
from sqlalchemy.exc import OperationalError

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.computador import db  # Não precisa mais importar os modelos aqui
from src.routes.computador import computador_bp
from src.routes.auth import auth_bp, init_admin_user

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Habilitar CORS para todas as rotas
CORS(app)

app.register_blueprint(computador_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Configuração do banco de dados a partir da variável de ambiente
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    raise ValueError("A variável de ambiente DATABASE_URL não foi definida.")

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# A FUNÇÃO populate_database() FOI REMOVIDA DESTE ARQUIVO

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

def wait_for_db():
    """Espera o banco de dados ficar pronto para aceitar conexões."""
    retries = 5
    while retries > 0:
        try:
            with app.app_context():
                db.engine.connect().close()
            print("Database connection successful!")
            return
        except OperationalError:
            retries -= 1
            print(f"Database not ready, retrying in 5 seconds... ({retries} retries left)")
            time.sleep(5)
    print("Could not connect to the database after several retries.")
    sys.exit(1) # Sai se não conseguir conectar

# Initialize database and admin user on startup
wait_for_db()

with app.app_context():
    db.create_all()
    init_admin_user()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)