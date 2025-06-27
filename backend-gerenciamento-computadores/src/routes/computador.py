from flask import Blueprint, request, jsonify
from src.models.computador import db, ModeloComputador, Gerencia, Patrimonio

computador_bp = Blueprint('computador', __name__)

# Rotas para Modelo do Computador
@computador_bp.route('/modelos', methods=['GET'])
def get_modelos():
    modelos = ModeloComputador.query.all()
    return jsonify([modelo.to_dict() for modelo in modelos])

@computador_bp.route('/modelos', methods=['POST'])
def create_modelo():
    data = request.get_json()
    
    modelo = ModeloComputador(
        nome=data['nome'],  # <-- ADICIONADO
        processador=data['processador'],
        quantidade_ram=data['quantidade_ram'],
        tipo_ram=data['tipo_ram'],
        sistema_operacional=data['sistema_operacional'],
        ssd=data['ssd']
    )
    
    db.session.add(modelo)
    db.session.commit()
    
    return jsonify(modelo.to_dict()), 201

@computador_bp.route('/modelos/<int:modelo_id>', methods=['PUT'])
def update_modelo(modelo_id):
    modelo = ModeloComputador.query.get_or_404(modelo_id)
    data = request.get_json()
    
    modelo.nome = data.get('nome', modelo.nome)  # <-- ADICIONADO
    modelo.processador = data.get('processador', modelo.processador)
    modelo.quantidade_ram = data.get('quantidade_ram', modelo.quantidade_ram)
    modelo.tipo_ram = data.get('tipo_ram', modelo.tipo_ram)
    modelo.sistema_operacional = data.get('sistema_operacional', modelo.sistema_operacional)
    modelo.ssd = data.get('ssd', modelo.ssd)
    
    db.session.commit()
    
    return jsonify(modelo.to_dict())

@computador_bp.route('/modelos/<int:modelo_id>', methods=['DELETE'])
def delete_modelo(modelo_id):
    modelo = ModeloComputador.query.get_or_404(modelo_id)
    
    # Verificar se há patrimônios usando este modelo
    if modelo.patrimonios:
        return jsonify({'error': 'Não é possível excluir modelo que possui patrimônios associados'}), 400
    
    db.session.delete(modelo)
    db.session.commit()
    
    return '', 204

# Rotas para Gerência
@computador_bp.route('/gerencias', methods=['GET'])
def get_gerencias():
    gerencias = Gerencia.query.all()
    return jsonify([gerencia.to_dict() for gerencia in gerencias])

@computador_bp.route('/gerencias', methods=['POST'])
def create_gerencia():
    data = request.get_json()
    
    gerencia = Gerencia(nome=data['nome'])
    
    db.session.add(gerencia)
    db.session.commit()
    
    return jsonify(gerencia.to_dict()), 201

@computador_bp.route('/gerencias/<int:gerencia_id>', methods=['PUT'])
def update_gerencia(gerencia_id):
    gerencia = Gerencia.query.get_or_404(gerencia_id)
    data = request.get_json()
    
    gerencia.nome = data.get('nome', gerencia.nome)
    
    db.session.commit()
    
    return jsonify(gerencia.to_dict())

@computador_bp.route('/gerencias/<int:gerencia_id>', methods=['DELETE'])
def delete_gerencia(gerencia_id):
    gerencia = Gerencia.query.get_or_404(gerencia_id)
    
    # Verificar se há patrimônios usando esta gerência
    if gerencia.patrimonios:
        return jsonify({'error': 'Não é possível excluir gerência que possui patrimônios associados'}), 400
    
    db.session.delete(gerencia)
    db.session.commit()
    
    return '', 204

# Rotas para Patrimônio
@computador_bp.route('/patrimonios', methods=['GET'])
def get_patrimonios():
    patrimonios = Patrimonio.query.all()
    return jsonify([patrimonio.to_dict() for patrimonio in patrimonios])

@computador_bp.route('/patrimonios', methods=['POST'])
def create_patrimonio():
    data = request.get_json()
    
    patrimonio = Patrimonio(
        patrimonio=data['patrimonio'],
        nome_servidor_responsavel=data['nome_servidor_responsavel'],
        modelo_id=data['modelo_id'],
        gerencia_id=data['gerencia_id']
    )
    
    db.session.add(patrimonio)
    db.session.commit()
    
    return jsonify(patrimonio.to_dict()), 201

@computador_bp.route('/patrimonios/<int:patrimonio_id>', methods=['PUT'])
def update_patrimonio(patrimonio_id):
    patrimonio = Patrimonio.query.get_or_404(patrimonio_id)
    data = request.get_json()
    
    patrimonio.patrimonio = data.get('patrimonio', patrimonio.patrimonio)
    patrimonio.nome_servidor_responsavel = data.get('nome_servidor_responsavel', patrimonio.nome_servidor_responsavel)
    patrimonio.modelo_id = data.get('modelo_id', patrimonio.modelo_id)
    patrimonio.gerencia_id = data.get('gerencia_id', patrimonio.gerencia_id)
    
    db.session.commit()
    
    return jsonify(patrimonio.to_dict())

@computador_bp.route('/patrimonios/<int:patrimonio_id>', methods=['DELETE'])
def delete_patrimonio(patrimonio_id):
    patrimonio = Patrimonio.query.get_or_404(patrimonio_id)
    
    db.session.delete(patrimonio)
    db.session.commit()
    
    return '', 204

