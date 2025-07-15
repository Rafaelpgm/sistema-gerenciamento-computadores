from flask import Blueprint, request, jsonify
from src.models.computador import db, ModeloComputador, Gerencia, Patrimonio, Layout, BaixaPatrimonial
import json

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
    
    # Criar registro na tabela baixa_patrimonial mantendo a gerência
    baixa = BaixaPatrimonial(
        patrimonio=patrimonio.patrimonio,
        nome_servidor_responsavel=patrimonio.nome_servidor_responsavel,
        modelo_id=patrimonio.modelo_id,
        gerencia_id=patrimonio.gerencia_id,  # Manter a gerência original
        motivo_baixa='Excluído via sistema'
    )
    
    db.session.add(baixa)
    db.session.delete(patrimonio)
    db.session.commit()
    
    return '', 204

# Rotas para Baixa Patrimonial
@computador_bp.route('/baixa-patrimonial', methods=['GET'])
def get_baixa_patrimonial():
    """Retorna todos os patrimônios baixados"""
    try:
        baixas = BaixaPatrimonial.query.all()
        return jsonify([baixa.to_dict() for baixa in baixas])
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar baixa patrimonial: {str(e)}'}), 500

@computador_bp.route('/baixa-patrimonial/<int:baixa_id>/restaurar', methods=['POST'])
def restaurar_patrimonio(baixa_id):
    """Restaura um patrimônio da baixa patrimonial"""
    try:
        # Verificar se o registro da baixa ainda existe
        baixa = BaixaPatrimonial.query.get(baixa_id)
        if not baixa:
            return jsonify({'error': 'Patrimônio não encontrado na baixa patrimonial'}), 404
        
        # Verificar se o número de patrimônio não existe na tabela ativa
        existing_patrimonio = Patrimonio.query.filter_by(patrimonio=baixa.patrimonio).first()
        if existing_patrimonio:
            return jsonify({'error': 'Patrimônio já existe na tabela ativa. Não é possível restaurar.'}), 400
        
        # Criar novo registro na tabela patrimonio com a gerência original
        patrimonio_restaurado = Patrimonio(
            patrimonio=baixa.patrimonio,
            nome_servidor_responsavel=baixa.nome_servidor_responsavel,
            modelo_id=baixa.modelo_id,
            gerencia_id=baixa.gerencia_id  # Manter a gerência original
        )
        
        # Executar em uma transação
        db.session.add(patrimonio_restaurado)
        db.session.delete(baixa)
        db.session.flush()  # Força a execução antes do commit
        db.session.commit()
        
        return jsonify(patrimonio_restaurado.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        
        if 'duplicate key value violates unique constraint' in error_msg:
            return jsonify({'error': 'Patrimônio já existe na tabela ativa. Verifique se não foi restaurado anteriormente.'}), 400
        elif 'UniqueViolation' in error_msg:
            return jsonify({'error': 'Conflito de dados. O patrimônio pode já ter sido restaurado.'}), 400
        else:
            return jsonify({'error': f'Erro interno: {error_msg}'}), 500

@computador_bp.route('/baixa-patrimonial/<int:baixa_id>', methods=['DELETE'])
def delete_baixa_patrimonial(baixa_id):
    """Remove permanentemente um patrimônio da baixa patrimonial"""
    baixa = BaixaPatrimonial.query.get_or_404(baixa_id)
    
    db.session.delete(baixa)
    db.session.commit()
    
    return '', 204

# Rotas para Layout
@computador_bp.route('/layouts', methods=['GET'])
def get_layouts():
    """Retorna todos os layouts"""
    layouts = Layout.query.all()
    return jsonify([layout.to_dict() for layout in layouts])

@computador_bp.route('/layouts/<int:gerencia_id>', methods=['GET'])
def get_layout_by_gerencia(gerencia_id):
    """Retorna o layout de uma gerência específica"""
    layout = Layout.query.filter_by(gerencia_id=gerencia_id).first()
    if layout:
        return jsonify(layout.to_dict())
    else:
        # Retorna layout vazio com estrutura completa
        return jsonify({
            'layout_data': {},
            'grid_cols': 4,
            'grid_rows': 4
        }), 200

@computador_bp.route('/layouts', methods=['POST'])
def create_layout():
    """Cria um novo layout para uma gerência"""
    data = request.get_json()
    
    # Verificar se já existe layout para esta gerência
    existing_layout = Layout.query.filter_by(gerencia_id=data['gerencia_id']).first()
    if existing_layout:
        return jsonify({'error': 'Layout já existe para esta gerência. Use PUT para atualizar.'}), 400
    
    layout = Layout(
        gerencia_id=data['gerencia_id'],
        layout_data=json.dumps(data['layout_data']),
        grid_cols=data.get('grid_cols', 4),
        grid_rows=data.get('grid_rows', 4)
    )
    
    db.session.add(layout)
    db.session.commit()
    
    return jsonify(layout.to_dict()), 201

@computador_bp.route('/layouts/<int:gerencia_id>', methods=['PUT'])
def update_layout(gerencia_id):
    """Atualiza ou cria um layout para uma gerência"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados JSON não fornecidos'}), 400
        
        # Validar dados de entrada
        layout_data = data.get('layout_data', {})
        grid_cols = max(1, min(20, data.get('grid_cols', 4)))  # Entre 1 e 20
        grid_rows = max(1, min(20, data.get('grid_rows', 4)))  # Entre 1 e 20
        
        # Garantir que layout_data seja serializável
        try:
            layout_json = json.dumps(layout_data)
        except (TypeError, ValueError) as e:
            return jsonify({'error': f'Dados de layout inválidos: {str(e)}'}), 400
        
        layout = Layout.query.filter_by(gerencia_id=gerencia_id).first()
        
        if layout:
            # Atualizar layout existente
            layout.layout_data = layout_json
            layout.grid_cols = grid_cols
            layout.grid_rows = grid_rows
            db.session.commit()
            return jsonify(layout.to_dict())
        else:
            # Criar novo layout
            new_layout = Layout(
                gerencia_id=gerencia_id,
                layout_data=layout_json,
                grid_cols=grid_cols,
                grid_rows=grid_rows
            )
            db.session.add(new_layout)
            db.session.commit()
            return jsonify(new_layout.to_dict()), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@computador_bp.route('/layouts/<int:gerencia_id>', methods=['DELETE'])
def delete_layout(gerencia_id):
    """Remove o layout de uma gerência"""
    layout = Layout.query.filter_by(gerencia_id=gerencia_id).first()
    
    if not layout:
        return jsonify({'error': 'Layout não encontrado'}), 404
    
    db.session.delete(layout)
    db.session.commit()
    
    return '', 204

