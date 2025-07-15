from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class ModeloComputador(db.Model):
    __tablename__ = 'modelo_computador'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)  # <-- LINHA ADICIONADA
    processador = db.Column(db.String(100), nullable=False)
    quantidade_ram = db.Column(db.String(20), nullable=False)
    tipo_ram = db.Column(db.String(20), nullable=False)
    sistema_operacional = db.Column(db.String(50), nullable=False)
    ssd = db.Column(db.Boolean, nullable=False)
    
    # Relacionamento com patrimônios
    patrimonios = db.relationship('Patrimonio', backref='modelo', lazy=True)

    def __repr__(self):
        return f'<ModeloComputador {self.processador}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome, # <-- A LINHA QUE FALTAVA!
            'processador': self.processador,
            'quantidade_ram': self.quantidade_ram,
            'tipo_ram': self.tipo_ram,
            'sistema_operacional': self.sistema_operacional,
            'ssd': self.ssd
        }

class Gerencia(db.Model):
    __tablename__ = 'gerencia'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    
    # Relacionamento com patrimônios
    patrimonios = db.relationship('Patrimonio', backref='gerencia', lazy=True)

    def __repr__(self):
        return f'<Gerencia {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome
        }

class Patrimonio(db.Model):
    __tablename__ = 'patrimonio'
    
    id = db.Column(db.Integer, primary_key=True)
    patrimonio = db.Column(db.String(50), nullable=False, unique=True)
    nome_servidor_responsavel = db.Column(db.String(100), nullable=False)
    modelo_id = db.Column(db.Integer, db.ForeignKey('modelo_computador.id'), nullable=False)
    gerencia_id = db.Column(db.Integer, db.ForeignKey('gerencia.id'), nullable=False)

    def __repr__(self):
        return f'<Patrimonio {self.patrimonio}>'

    def to_dict(self):
        return {
            'id': self.id,
            'patrimonio': self.patrimonio,
            'nome_servidor_responsavel': self.nome_servidor_responsavel,
            'modelo_id': self.modelo_id,
            'gerencia_id': self.gerencia_id,
            'modelo': self.modelo.to_dict() if self.modelo else None,
            'gerencia': self.gerencia.to_dict() if self.gerencia else None
        }

class Layout(db.Model):
    __tablename__ = 'layout'
    
    id = db.Column(db.Integer, primary_key=True)
    gerencia_id = db.Column(db.Integer, db.ForeignKey('gerencia.id'), nullable=False, unique=True)
    layout_data = db.Column(db.Text, nullable=False)  # JSON string com as posições
    grid_cols = db.Column(db.Integer, nullable=False, default=4)  # Número de colunas do grid
    grid_rows = db.Column(db.Integer, nullable=False, default=4)  # Número de linhas do grid
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Relacionamento com gerência
    gerencia = db.relationship('Gerencia', backref=db.backref('layout', uselist=False))

    def __repr__(self):
        return f'<Layout gerencia_id={self.gerencia_id}>'

    def to_dict(self):
        import json
        
        # Tentar fazer parse do layout_data, usar {} se inválido
        try:
            layout_data = json.loads(self.layout_data) if self.layout_data else {}
        except (json.JSONDecodeError, TypeError):
            layout_data = {}
            
        return {
            'id': self.id,
            'gerencia_id': self.gerencia_id,
            'layout_data': layout_data,
            'grid_cols': self.grid_cols or 4,
            'grid_rows': self.grid_rows or 4,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class BaixaPatrimonial(db.Model):
    __tablename__ = 'baixa_patrimonial'
    
    id = db.Column(db.Integer, primary_key=True)
    patrimonio = db.Column(db.String(50), nullable=False, unique=True)
    nome_servidor_responsavel = db.Column(db.String(100), nullable=False)
    modelo_id = db.Column(db.Integer, db.ForeignKey('modelo_computador.id'), nullable=False)
    gerencia_id = db.Column(db.Integer, db.ForeignKey('gerencia.id'), nullable=True)
    data_baixa = db.Column(db.DateTime, default=db.func.current_timestamp())
    motivo_baixa = db.Column(db.Text)

    # Relacionamentos
    modelo = db.relationship('ModeloComputador', backref='baixas_patrimoniais')
    gerencia = db.relationship('Gerencia', backref='baixas_patrimoniais')

    def __repr__(self):
        return f'<BaixaPatrimonial {self.patrimonio}>'

    def to_dict(self):
        return {
            'id': self.id,
            'patrimonio': self.patrimonio,
            'nome_servidor_responsavel': self.nome_servidor_responsavel,
            'modelo_id': self.modelo_id,
            'gerencia_id': self.gerencia_id,
            'data_baixa': self.data_baixa.isoformat() if self.data_baixa else None,
            'motivo_baixa': self.motivo_baixa,
            'modelo': self.modelo.to_dict() if self.modelo else None,
            'gerencia': self.gerencia.to_dict() if self.gerencia else None
        }

