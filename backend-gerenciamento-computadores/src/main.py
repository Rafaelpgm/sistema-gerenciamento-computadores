import os
import sys
# import sqlite3
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.computador import db, ModeloComputador, Gerencia, Patrimonio
from src.routes.computador import computador_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Habilitar CORS para todas as rotas
CORS(app)

app.register_blueprint(computador_bp, url_prefix='/api')

# --- INÍCIO DA MUDANÇA ---

# Configuração do banco de dados a partir da variável de ambiente
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    raise ValueError("A variável de ambiente DATABASE_URL não foi definida.")

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# --- FIM DA MUDANÇA ---


# Configuração do banco de dados ANTIGA
# app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)

def populate_database():
    """Popula o banco de dados com os dados da planilha"""
    
    # Dados dos modelos
    modelos_data = [
        {'id': 1, 'nome': 'Arquimedes H110', 'processador': 'i3 7100', 'quantidade_ram': '4GB', 'tipo_ram': 'DDR4', 'sistema_operacional': '10', 'ssd': False},
        {'id': 2, 'nome': 'Daten ou Positivo Antigo', 'processador': 'i3 4100', 'quantidade_ram': '4GB', 'tipo_ram': 'DDR3', 'sistema_operacional': '8', 'ssd': False},
        {'id': 3, 'nome': 'Positivo D6200', 'processador': 'i3 8100', 'quantidade_ram': '16GB', 'tipo_ram': 'DDR4', 'sistema_operacional': '11', 'ssd': True},
        {'id': 4, 'nome': 'Lenovo M75s', 'processador': 'Ryzen 5 PRO 5650G', 'quantidade_ram': '16GB', 'tipo_ram': 'DDR4', 'sistema_operacional': '11', 'ssd': True},
        {'id': 5, 'nome': 'Positivo Antigo modificado', 'processador': 'i3 4100', 'quantidade_ram': '16GB', 'tipo_ram': 'DDR3', 'sistema_operacional': '8', 'ssd': False}
    ]
    
    # Dados das gerências
    gerencias_data = [
        {'id': 1, 'nome': 'Andar 2'}, {'id': 2, 'nome': 'Assejur SMASAC'}, {'id': 3, 'nome': 'Assejur SMSA'},
        {'id': 4, 'nome': 'DIAJ - CARTORIO'}, {'id': 5, 'nome': 'DIAJ - DIRETORIA'}, {'id': 6, 'nome': 'DIAJ - DISTRIBUICAO'},
        {'id': 7, 'nome': 'DIAJ - DISTRIBUIÇAO'}, {'id': 8, 'nome': 'DIAJ - DISTRIBUIÇÃO'}, {'id': 9, 'nome': 'DIAJ - PROTOCOLO'},
        {'id': 10, 'nome': 'DIAJ - RPV'}, {'id': 11, 'nome': 'DICP'}, {'id': 12, 'nome': 'DPGF'},
        {'id': 13, 'nome': 'DTAT - INFORMATICA'}, {'id': 14, 'nome': 'GEPESS DIRETORIA'}, {'id': 15, 'nome': 'GEPESS GAB.'},
        {'id': 16, 'nome': 'RECEPÇÃO GAB.'}, {'id': 17, 'nome': 'SALA 1'}, {'id': 18, 'nome': 'SALA 10'},
        {'id': 19, 'nome': 'SALA 11'}, {'id': 20, 'nome': 'SALA 12'}, {'id': 21, 'nome': 'SALA 13'},
        {'id': 22, 'nome': 'SALA 2'}, {'id': 23, 'nome': 'SALA 3'}, {'id': 24, 'nome': 'Sala 4'},
        {'id': 25, 'nome': 'SALA 4'}, {'id': 26, 'nome': 'SALA 5'}, {'id': 27, 'nome': 'SALA 6'},
        {'id': 28, 'nome': 'SALA 7'}, {'id': 29, 'nome': 'SALA 8'}, {'id': 30, 'nome': 'SALA 9'},
        {'id': 31, 'nome': 'SALA CHEFE GAB.'}, {'id': 32, 'nome': 'SALA DE REUNIAO'}, {'id': 33, 'nome': 'SALA DO PROC. GERAL'},
        {'id': 34, 'nome': 'SALA SUBPROC. GERAL'}, {'id': 35, 'nome': 'zAlmoxarifado'}
    ]
    
    # Verificar se já existem dados
    if ModeloComputador.query.first() is None:
        # Inserir modelos
        for modelo_data in modelos_data:
            modelo = ModeloComputador(**modelo_data)
            db.session.add(modelo)
        
        # Inserir gerências
        for gerencia_data in gerencias_data:
            gerencia = Gerencia(**gerencia_data)
            db.session.add(gerencia)
        
        db.session.commit()
    
    # Verificar se patrimônios já foram inseridos
    if Patrimonio.query.first() is None:

        patrimonios_data = [
            {'id': 1, 'patrimonio': '10574', 'nome_servidor_responsavel': 'Cristine Rattes', 'modelo_id': 1, 'gerencia_id': 1},
            {'id': 2, 'patrimonio': '10547', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 2},
            {'id': 3, 'patrimonio': '94959', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 2},
            {'id': 4, 'patrimonio': '97401', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 2},
            {'id': 5, 'patrimonio': '10584', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 3},
            {'id': 6, 'patrimonio': '94926', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 4},
            {'id': 7, 'patrimonio': '5687', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 4},
            {'id': 8, 'patrimonio': '97411', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 4},
            {'id': 9, 'patrimonio': '10528', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 4},
            {'id': 10, 'patrimonio': '10617', 'nome_servidor_responsavel': 'Luciana Melo/Marcia', 'modelo_id': 1, 'gerencia_id': 4},
            {'id': 11, 'patrimonio': '18517', 'nome_servidor_responsavel': 'Marta Elena', 'modelo_id': 3, 'gerencia_id': 4},
            {'id': 12, 'patrimonio': '10551', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 4},
            {'id': 13, 'patrimonio': '18513', 'nome_servidor_responsavel': 'Barbara Magalhaes', 'modelo_id': 3, 'gerencia_id': 5},
            {'id': 14, 'patrimonio': '20758', 'nome_servidor_responsavel': 'Karina Gomes', 'modelo_id': 3, 'gerencia_id': 5},
            {'id': 15, 'patrimonio': '10545', 'nome_servidor_responsavel': 'Adelson', 'modelo_id': 1, 'gerencia_id': 6},
            {'id': 16, 'patrimonio': '18519', 'nome_servidor_responsavel': 'Maria Isabel', 'modelo_id': 3, 'gerencia_id': 7},
            {'id': 17, 'patrimonio': '34568', 'nome_servidor_responsavel': 'Karine Lanza', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 18, 'patrimonio': '34570', 'nome_servidor_responsavel': 'Gislaine', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 19, 'patrimonio': '10537', 'nome_servidor_responsavel': 'Adriano', 'modelo_id': 1, 'gerencia_id': 8},
            {'id': 20, 'patrimonio': '20762', 'nome_servidor_responsavel': 'Ana Laura', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 21, 'patrimonio': '10555', 'nome_servidor_responsavel': 'Alessandra', 'modelo_id': 1, 'gerencia_id': 8},
            {'id': 22, 'patrimonio': '19188', 'nome_servidor_responsavel': 'Gracielle', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 23, 'patrimonio': '34571', 'nome_servidor_responsavel': 'Ernesto', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 24, 'patrimonio': '10604', 'nome_servidor_responsavel': 'Tatiana', 'modelo_id': 1, 'gerencia_id': 8},
            {'id': 25, 'patrimonio': '10562', 'nome_servidor_responsavel': 'Cristiane Lima', 'modelo_id': 1, 'gerencia_id': 8},
            {'id': 26, 'patrimonio': '19189', 'nome_servidor_responsavel': 'Raquel', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 27, 'patrimonio': '18527', 'nome_servidor_responsavel': 'Ricardo Carvalho', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 28, 'patrimonio': '18537', 'nome_servidor_responsavel': 'Luciana Pessoa', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 29, 'patrimonio': '20761', 'nome_servidor_responsavel': 'Elane', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 30, 'patrimonio': '20766', 'nome_servidor_responsavel': 'Maria Lopes', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 31, 'patrimonio': '10525', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 8},
            {'id': 32, 'patrimonio': '20767', 'nome_servidor_responsavel': 'Carolina Francisco', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 33, 'patrimonio': '18536', 'nome_servidor_responsavel': 'Ronaldo', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 34, 'patrimonio': '10609', 'nome_servidor_responsavel': 'Paula', 'modelo_id': 1, 'gerencia_id': 8},
            {'id': 35, 'patrimonio': '20768', 'nome_servidor_responsavel': 'Cristine Rattes', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 36, 'patrimonio': '10556', 'nome_servidor_responsavel': 'Joyce', 'modelo_id': 1, 'gerencia_id': 8},
            {'id': 37, 'patrimonio': '18521', 'nome_servidor_responsavel': 'Bruno Lage', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 38, 'patrimonio': '94928', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 8},
            {'id': 39, 'patrimonio': '97406', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 8},
            {'id': 40, 'patrimonio': '94934', 'nome_servidor_responsavel': 'Estaçao', 'modelo_id': 2, 'gerencia_id': 8},
            {'id': 41, 'patrimonio': '18526', 'nome_servidor_responsavel': 'Ao Lado da Karine', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 42, 'patrimonio': '18502', 'nome_servidor_responsavel': 'Ranaiza', 'modelo_id': 3, 'gerencia_id': 8},
            {'id': 43, 'patrimonio': '10522', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 8},
            {'id': 44, 'patrimonio': '10527', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 9},
            {'id': 45, 'patrimonio': '94917', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 9},
            {'id': 46, 'patrimonio': '20756', 'nome_servidor_responsavel': 'Kaua', 'modelo_id': 3, 'gerencia_id': 9},
            {'id': 47, 'patrimonio': '10571', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 9},
            {'id': 48, 'patrimonio': '20759', 'nome_servidor_responsavel': 'Digitalizacao', 'modelo_id': 3, 'gerencia_id': 9},
            {'id': 49, 'patrimonio': '97430', 'nome_servidor_responsavel': 'Mauricio', 'modelo_id': 2, 'gerencia_id': 9},
            {'id': 50, 'patrimonio': '18518', 'nome_servidor_responsavel': 'Digitalizacao', 'modelo_id': 3, 'gerencia_id': 9},
            {'id': 51, 'patrimonio': '10521', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 10},
            {'id': 52, 'patrimonio': '10557', 'nome_servidor_responsavel': 'Marlene', 'modelo_id': 1, 'gerencia_id': 10},
            {'id': 53, 'patrimonio': '34569', 'nome_servidor_responsavel': 'Cristina', 'modelo_id': 3, 'gerencia_id': 10},
            {'id': 54, 'patrimonio': '10615', 'nome_servidor_responsavel': 'Josina', 'modelo_id': 1, 'gerencia_id': 10},
            {'id': 55, 'patrimonio': '97418', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 10},
            {'id': 56, 'patrimonio': '10531', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 10},
            {'id': 57, 'patrimonio': '18515', 'nome_servidor_responsavel': 'Karla Patricia', 'modelo_id': 3, 'gerencia_id': 10},
            {'id': 58, 'patrimonio': '18534', 'nome_servidor_responsavel': 'Elaine Mendes', 'modelo_id': 3, 'gerencia_id': 10},
            {'id': 59, 'patrimonio': '10595', 'nome_servidor_responsavel': 'Talita', 'modelo_id': 1, 'gerencia_id': 10},
            {'id': 60, 'patrimonio': '10546', 'nome_servidor_responsavel': 'Luciana', 'modelo_id': 1, 'gerencia_id': 10},
            {'id': 61, 'patrimonio': '10608', 'nome_servidor_responsavel': 'Flaviana', 'modelo_id': 1, 'gerencia_id': 10},
            {'id': 62, 'patrimonio': '10536', 'nome_servidor_responsavel': 'Cleidiane', 'modelo_id': 1, 'gerencia_id': 10},
            {'id': 63, 'patrimonio': '94956', 'nome_servidor_responsavel': 'Mariana de Aguiar', 'modelo_id': 2, 'gerencia_id': 10},
            {'id': 64, 'patrimonio': '97413', 'nome_servidor_responsavel': 'Andreia', 'modelo_id': 2, 'gerencia_id': 10},
            {'id': 65, 'patrimonio': '97393', 'nome_servidor_responsavel': 'Carlos', 'modelo_id': 2, 'gerencia_id': 10},
            {'id': 66, 'patrimonio': '94918', 'nome_servidor_responsavel': 'Helio', 'modelo_id': 2, 'gerencia_id': 10},
            {'id': 67, 'patrimonio': '18505', 'nome_servidor_responsavel': 'Kenia Aparecida', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 68, 'patrimonio': '20748', 'nome_servidor_responsavel': 'Josue Denio', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 69, 'patrimonio': '34567', 'nome_servidor_responsavel': 'Rosemaire Ferreira', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 70, 'patrimonio': '18503', 'nome_servidor_responsavel': 'Marta Paulino', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 71, 'patrimonio': '18504', 'nome_servidor_responsavel': 'Ana Claudia Praxedes', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 72, 'patrimonio': '10590', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 73, 'patrimonio': '10540', 'nome_servidor_responsavel': 'Irade', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 74, 'patrimonio': '10542', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 75, 'patrimonio': '10558', 'nome_servidor_responsavel': 'Maria Aparecida dos Santos', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 76, 'patrimonio': '20750', 'nome_servidor_responsavel': 'Edmar', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 77, 'patrimonio': '10601', 'nome_servidor_responsavel': 'Ana Carolina Pousa', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 78, 'patrimonio': '10600', 'nome_servidor_responsavel': 'Gabriela Evangelista', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 79, 'patrimonio': '10589', 'nome_servidor_responsavel': 'Adriana Miranda', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 80, 'patrimonio': '10602', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 81, 'patrimonio': '20755', 'nome_servidor_responsavel': 'Vitória Dias', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 82, 'patrimonio': '10533', 'nome_servidor_responsavel': 'Vitoria Dias', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 83, 'patrimonio': '10538', 'nome_servidor_responsavel': 'Denise Maria', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 84, 'patrimonio': '10605', 'nome_servidor_responsavel': 'Widler', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 85, 'patrimonio': '18522', 'nome_servidor_responsavel': 'Jose Affonso', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 86, 'patrimonio': '20747', 'nome_servidor_responsavel': 'Irade', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 87, 'patrimonio': '20749', 'nome_servidor_responsavel': 'Michelle Cristiane', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 88, 'patrimonio': '10543', 'nome_servidor_responsavel': 'Kenia Aparecida', 'modelo_id': 1, 'gerencia_id': 11},
            {'id': 89, 'patrimonio': '97428', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 11},
            {'id': 90, 'patrimonio': '94948', 'nome_servidor_responsavel': 'Cristina Maria', 'modelo_id': 2, 'gerencia_id': 11},
            {'id': 91, 'patrimonio': '18524', 'nome_servidor_responsavel': 'Margareth Gomes', 'modelo_id': 3, 'gerencia_id': 11},
            {'id': 92, 'patrimonio': '5690', 'nome_servidor_responsavel': 'Estação Remota', 'modelo_id': 2, 'gerencia_id': 12},
            {'id': 93, 'patrimonio': '10610', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 12},
            {'id': 94, 'patrimonio': '97395', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 12},
            {'id': 95, 'patrimonio': '18506', 'nome_servidor_responsavel': 'Dircy', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 96, 'patrimonio': '20753', 'nome_servidor_responsavel': 'Simone', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 97, 'patrimonio': '20754', 'nome_servidor_responsavel': 'Laura', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 98, 'patrimonio': '18531', 'nome_servidor_responsavel': 'Ana Cristina', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 99, 'patrimonio': '18507', 'nome_servidor_responsavel': 'Fernanda Machado', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 100, 'patrimonio': '18532', 'nome_servidor_responsavel': 'Fernanda', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 101, 'patrimonio': '20752', 'nome_servidor_responsavel': 'Silvia', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 102, 'patrimonio': '20757', 'nome_servidor_responsavel': 'Washington', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 103, 'patrimonio': '20751', 'nome_servidor_responsavel': 'Rodrigo', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 104, 'patrimonio': '18510', 'nome_servidor_responsavel': 'Isabel', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 105, 'patrimonio': '10529', 'nome_servidor_responsavel': 'Helio', 'modelo_id': 1, 'gerencia_id': 12},
            {'id': 106, 'patrimonio': '18508', 'nome_servidor_responsavel': 'Claudia', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 107, 'patrimonio': '10532', 'nome_servidor_responsavel': 'Antonio', 'modelo_id': 1, 'gerencia_id': 12},
            {'id': 108, 'patrimonio': '18511', 'nome_servidor_responsavel': 'Ricardo', 'modelo_id': 3, 'gerencia_id': 12},
            {'id': 109, 'patrimonio': '10581', 'nome_servidor_responsavel': '-', 'modelo_id': 1, 'gerencia_id': 12},
            {'id': 110, 'patrimonio': '51009', 'nome_servidor_responsavel': 'Rafael Assumpção', 'modelo_id': 4, 'gerencia_id': 13},
            {'id': 111, 'patrimonio': '70703', 'nome_servidor_responsavel': 'Marco Ribeiro', 'modelo_id': 4, 'gerencia_id': 13},
            {'id': 112, 'patrimonio': '70816', 'nome_servidor_responsavel': 'Danilo Rodrigues', 'modelo_id': 4, 'gerencia_id': 13},
            {'id': 113, 'patrimonio': '70779', 'nome_servidor_responsavel': 'Isaac Martins', 'modelo_id': 4, 'gerencia_id': 13},
            {'id': 114, 'patrimonio': '51030', 'nome_servidor_responsavel': 'Danilo Lima', 'modelo_id': 4, 'gerencia_id': 13},
            {'id': 115, 'patrimonio': '70778', 'nome_servidor_responsavel': 'Francisco Meirelles', 'modelo_id': 4, 'gerencia_id': 13},
            {'id': 116, 'patrimonio': '18512', 'nome_servidor_responsavel': 'Cristhian', 'modelo_id': 3, 'gerencia_id': 13},
            {'id': 117, 'patrimonio': '10580', 'nome_servidor_responsavel': 'Servidor RENAVAN', 'modelo_id': 1, 'gerencia_id': 13},
            {'id': 118, 'patrimonio': '94947', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 5, 'gerencia_id': 13},
            {'id': 119, 'patrimonio': '94906', 'nome_servidor_responsavel': 'Servidor SUPP', 'modelo_id': 5, 'gerencia_id': 13},
            {'id': 120, 'patrimonio': '94933', 'nome_servidor_responsavel': 'Servidor SUPP', 'modelo_id': 5, 'gerencia_id': 13},
            {'id': 121, 'patrimonio': '94931', 'nome_servidor_responsavel': 'Servidor SUPP', 'modelo_id': 5, 'gerencia_id': 13},
            {'id': 122, 'patrimonio': '94945', 'nome_servidor_responsavel': 'Servidor SUPP', 'modelo_id': 5, 'gerencia_id': 13},
            {'id': 123, 'patrimonio': '94929', 'nome_servidor_responsavel': 'Servidor SUPP', 'modelo_id': 5, 'gerencia_id': 13},
            {'id': 124, 'patrimonio': '94961', 'nome_servidor_responsavel': 'Servidor SUPP', 'modelo_id': 5, 'gerencia_id': 13},
            {'id': 125, 'patrimonio': '18529', 'nome_servidor_responsavel': 'Raphael Bessa', 'modelo_id': 3, 'gerencia_id': 14},
            {'id': 126, 'patrimonio': '10577', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 14},
            {'id': 127, 'patrimonio': '18538', 'nome_servidor_responsavel': 'Duda', 'modelo_id': 3, 'gerencia_id': 15},
            {'id': 128, 'patrimonio': '20760', 'nome_servidor_responsavel': 'Chamado/Valeria', 'modelo_id': 3, 'gerencia_id': 15},
            {'id': 129, 'patrimonio': '10592', 'nome_servidor_responsavel': 'Valeria', 'modelo_id': 1, 'gerencia_id': 15},
            {'id': 130, 'patrimonio': '18501', 'nome_servidor_responsavel': 'Thiago', 'modelo_id': 3, 'gerencia_id': 15},
            {'id': 131, 'patrimonio': '18530', 'nome_servidor_responsavel': 'Angela', 'modelo_id': 3, 'gerencia_id': 15},
            {'id': 132, 'patrimonio': '18516', 'nome_servidor_responsavel': 'Luiza', 'modelo_id': 3, 'gerencia_id': 15},
            {'id': 133, 'patrimonio': '10594', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 16},
            {'id': 134, 'patrimonio': '18520', 'nome_servidor_responsavel': 'Aparecida Tavares', 'modelo_id': 3, 'gerencia_id': 16},
            {'id': 135, 'patrimonio': '10569', 'nome_servidor_responsavel': 'Marina França', 'modelo_id': 1, 'gerencia_id': 17},
            {'id': 136, 'patrimonio': '97417', 'nome_servidor_responsavel': 'Renato Jose', 'modelo_id': 2, 'gerencia_id': 17},
            {'id': 137, 'patrimonio': '5688', 'nome_servidor_responsavel': 'Daniel Barros', 'modelo_id': 2, 'gerencia_id': 17},
            {'id': 138, 'patrimonio': '18525', 'nome_servidor_responsavel': 'Luciana Camargo/VInicius Magalhaes', 'modelo_id': 3, 'gerencia_id': 17},
            {'id': 139, 'patrimonio': '18523', 'nome_servidor_responsavel': 'Vinicius Nascimento/Guilherme', 'modelo_id': 3, 'gerencia_id': 18},
            {'id': 140, 'patrimonio': '10614', 'nome_servidor_responsavel': 'Leandro Penido', 'modelo_id': 1, 'gerencia_id': 18},
            {'id': 141, 'patrimonio': '10572', 'nome_servidor_responsavel': 'Carlos Ruas', 'modelo_id': 1, 'gerencia_id': 18},
            {'id': 142, 'patrimonio': '97571', 'nome_servidor_responsavel': 'Luiz Roberto', 'modelo_id': 2, 'gerencia_id': 18},
            {'id': 143, 'patrimonio': '10603', 'nome_servidor_responsavel': 'Maria Jocélia', 'modelo_id': 1, 'gerencia_id': 19},
            {'id': 144, 'patrimonio': '10599', 'nome_servidor_responsavel': 'Romero', 'modelo_id': 1, 'gerencia_id': 19},
            {'id': 145, 'patrimonio': '10598', 'nome_servidor_responsavel': 'Anna Júlia', 'modelo_id': 1, 'gerencia_id': 19},
            {'id': 146, 'patrimonio': '10549', 'nome_servidor_responsavel': 'Walter Santos', 'modelo_id': 1, 'gerencia_id': 19},
            {'id': 147, 'patrimonio': '97419', 'nome_servidor_responsavel': 'Luiz Olavo', 'modelo_id': 2, 'gerencia_id': 20},
            {'id': 148, 'patrimonio': '10613', 'nome_servidor_responsavel': 'Victor Teixeira', 'modelo_id': 1, 'gerencia_id': 20},
            {'id': 149, 'patrimonio': '10606', 'nome_servidor_responsavel': 'Yves', 'modelo_id': 1, 'gerencia_id': 20},
            {'id': 150, 'patrimonio': '19190', 'nome_servidor_responsavel': 'Luiz Felipe', 'modelo_id': 3, 'gerencia_id': 20},
            {'id': 151, 'patrimonio': '10585', 'nome_servidor_responsavel': 'Marina Ferreira', 'modelo_id': 1, 'gerencia_id': 21},
            {'id': 152, 'patrimonio': '10563', 'nome_servidor_responsavel': 'Marina Saad', 'modelo_id': 1, 'gerencia_id': 21},
            {'id': 153, 'patrimonio': '10607', 'nome_servidor_responsavel': 'Daniela Carla', 'modelo_id': 1, 'gerencia_id': 21},
            {'id': 154, 'patrimonio': '20765', 'nome_servidor_responsavel': 'Ingrid/Ana Magnabosco', 'modelo_id': 3, 'gerencia_id': 22},
            {'id': 155, 'patrimonio': '10567', 'nome_servidor_responsavel': 'Matheus Canazart', 'modelo_id': 1, 'gerencia_id': 22},
            {'id': 156, 'patrimonio': '10618', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 22},
            {'id': 157, 'patrimonio': '10575', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 22},
            {'id': 158, 'patrimonio': '10579', 'nome_servidor_responsavel': 'Claudia Cristina', 'modelo_id': 1, 'gerencia_id': 23},
            {'id': 159, 'patrimonio': '10570', 'nome_servidor_responsavel': 'Lucienne Pitchon', 'modelo_id': 1, 'gerencia_id': 23},
            {'id': 160, 'patrimonio': '10582', 'nome_servidor_responsavel': 'Junia Franco', 'modelo_id': 1, 'gerencia_id': 23},
            {'id': 161, 'patrimonio': '18528', 'nome_servidor_responsavel': 'Alexandre Augusto', 'modelo_id': 3, 'gerencia_id': 23},
            {'id': 162, 'patrimonio': '19187', 'nome_servidor_responsavel': 'James Henrique', 'modelo_id': 3, 'gerencia_id': 24},
            {'id': 163, 'patrimonio': '10586', 'nome_servidor_responsavel': 'Eduardo Vilela', 'modelo_id': 1, 'gerencia_id': 24},
            {'id': 164, 'patrimonio': '10578', 'nome_servidor_responsavel': 'Cristiano Reis', 'modelo_id': 1, 'gerencia_id': 25},
            {'id': 165, 'patrimonio': '10523', 'nome_servidor_responsavel': 'Paulo Grahal', 'modelo_id': 1, 'gerencia_id': 25},
            {'id': 166, 'patrimonio': '10548', 'nome_servidor_responsavel': 'James Henrique', 'modelo_id': 1, 'gerencia_id': 25},
            {'id': 167, 'patrimonio': '10593', 'nome_servidor_responsavel': 'Marcelo Veiga', 'modelo_id': 1, 'gerencia_id': 26},
            {'id': 168, 'patrimonio': '20764', 'nome_servidor_responsavel': 'Bruno Pereira', 'modelo_id': 3, 'gerencia_id': 26},
            {'id': 169, 'patrimonio': '20763', 'nome_servidor_responsavel': 'Rodrigo Rabelo', 'modelo_id': 3, 'gerencia_id': 26},
            {'id': 170, 'patrimonio': '20769', 'nome_servidor_responsavel': 'Ricardo Perez', 'modelo_id': 3, 'gerencia_id': 26},
            {'id': 171, 'patrimonio': '10587', 'nome_servidor_responsavel': 'Rafael Dutra', 'modelo_id': 1, 'gerencia_id': 27},
            {'id': 172, 'patrimonio': '10564', 'nome_servidor_responsavel': 'Ana Cláudia', 'modelo_id': 1, 'gerencia_id': 27},
            {'id': 173, 'patrimonio': '10576', 'nome_servidor_responsavel': 'Vitória Jacob', 'modelo_id': 1, 'gerencia_id': 27},
            {'id': 174, 'patrimonio': '10573', 'nome_servidor_responsavel': 'Heloísa Carvalho', 'modelo_id': 1, 'gerencia_id': 27},
            {'id': 175, 'patrimonio': '10535', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 28},
            {'id': 176, 'patrimonio': '10534', 'nome_servidor_responsavel': 'Fernando Magalhães', 'modelo_id': 1, 'gerencia_id': 28},
            {'id': 177, 'patrimonio': '10530', 'nome_servidor_responsavel': 'Camila Pyramo', 'modelo_id': 1, 'gerencia_id': 28},
            {'id': 178, 'patrimonio': '10568', 'nome_servidor_responsavel': 'Fernando Couto', 'modelo_id': 1, 'gerencia_id': 28},
            {'id': 179, 'patrimonio': '10597', 'nome_servidor_responsavel': 'Delze Laureano', 'modelo_id': 1, 'gerencia_id': 29},
            {'id': 180, 'patrimonio': '10583', 'nome_servidor_responsavel': 'Luiz Fernando', 'modelo_id': 1, 'gerencia_id': 29},
            {'id': 181, 'patrimonio': '97405', 'nome_servidor_responsavel': 'Carlos Roedel', 'modelo_id': 2, 'gerencia_id': 29},
            {'id': 182, 'patrimonio': '18514', 'nome_servidor_responsavel': 'Pedro Victor/Rusvel Beltrame', 'modelo_id': 3, 'gerencia_id': 29},
            {'id': 183, 'patrimonio': '10524', 'nome_servidor_responsavel': 'Jéssica Zanco', 'modelo_id': 1, 'gerencia_id': 30},
            {'id': 184, 'patrimonio': '10620', 'nome_servidor_responsavel': 'Renata Sena', 'modelo_id': 1, 'gerencia_id': 30},
            {'id': 185, 'patrimonio': '10561', 'nome_servidor_responsavel': 'Júlio Cesar', 'modelo_id': 1, 'gerencia_id': 30},
            {'id': 186, 'patrimonio': '10541', 'nome_servidor_responsavel': 'Hercilia Procopio', 'modelo_id': 1, 'gerencia_id': 30},
            {'id': 187, 'patrimonio': '18509', 'nome_servidor_responsavel': 'Felipe', 'modelo_id': 3, 'gerencia_id': 31},
            {'id': 188, 'patrimonio': '94941', 'nome_servidor_responsavel': 'Reunião', 'modelo_id': 2, 'gerencia_id': 32},
            {'id': 189, 'patrimonio': '18535', 'nome_servidor_responsavel': 'Hercules Guerra', 'modelo_id': 3, 'gerencia_id': 33},
            {'id': 190, 'patrimonio': '18533', 'nome_servidor_responsavel': 'Izabela Boaventura', 'modelo_id': 3, 'gerencia_id': 34},
            {'id': 191, 'patrimonio': '10559', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 34},
            {'id': 192, 'patrimonio': '94939', 'nome_servidor_responsavel': 'nan', 'modelo_id': 2, 'gerencia_id': 35},
            {'id': 193, 'patrimonio': '10591', 'nome_servidor_responsavel': 'nan', 'modelo_id': 1, 'gerencia_id': 35},
            {'id': 194, 'patrimonio': '10619', 'nome_servidor_responsavel': 'nan', 'modelo_id': 1, 'gerencia_id': 35},
            {'id': 195, 'patrimonio': '97420', 'nome_servidor_responsavel': 'Eduardo Magalhães', 'modelo_id': 2, 'gerencia_id': 35},
            {'id': 196, 'patrimonio': '97412', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 35},
            {'id': 197, 'patrimonio': '10566', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 35},
            {'id': 198, 'patrimonio': '10560', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 35},
            {'id': 199, 'patrimonio': '10588', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 1, 'gerencia_id': 35},
            {'id': 200, 'patrimonio': '94944', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 35},
            {'id': 201, 'patrimonio': '97400', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 35},
            {'id': 202, 'patrimonio': '97436', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 35},
            {'id': 203, 'patrimonio': '97583', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 35},
            {'id': 204, 'patrimonio': '94916', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 35},
            {'id': 205, 'patrimonio': '94924', 'nome_servidor_responsavel': 'Estação', 'modelo_id': 2, 'gerencia_id': 35},
        ]
        
        for patrimonio_data in patrimonios_data:
            patrimonio = Patrimonio(**patrimonio_data)
            db.session.add(patrimonio)
        
        db.session.commit()

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
            # Tenta criar e fechar uma conexão para verificar se o DB está pronto
            db.engine.connect().close()
            print("Database connection successful!")
            return
        except OperationalError:
            retries -= 1
            print(f"Database not ready, retrying in 5 seconds... ({retries} retries left)")
            time.sleep(5)
    print("Could not connect to the database after several retries.")
    sys.exit(1) # Sai se não conseguir conectar


if __name__ == '__main__':
    with app.app_context():
        wait_for_db()
        db.create_all()
        populate_database()
    app.run(host='0.0.0.0', port=5000, debug=True)

