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

