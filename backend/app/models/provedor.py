# app/models/provedor.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import ProvedorBase # Importa a Base correta

# Modelos para ler do banco de dados do provedor (MariaDB)

class ChamadoProvedor(ProvedorBase):
    __tablename__ = 'su_oss_chamado'
    id = Column(Integer, primary_key=True)
    id_cliente = Column(Integer, ForeignKey('cliente.id'))
    id_assunto = Column(Integer, ForeignKey('su_oss_assunto.id'))
    data_abertura = Column(DateTime)
    data_fechamento = Column(DateTime)
    id_tecnico = Column(Integer)
    status = Column(String)
    __table_args__ = {'extend_existing': True}

class ClienteProvedor(ProvedorBase):
    __tablename__ = 'cliente'
    id = Column(Integer, primary_key=True)
    razao = Column(String)
    telefone_celular = Column(String)
    __table_args__ = {'extend_existing': True}

class AssuntoProvedor(ProvedorBase):
    __tablename__ = 'su_oss_assunto'
    id = Column(Integer, primary_key=True)
    assunto = Column(String)
    __table_args__ = {'extend_existing': True}

class TecnicoProvedor(ProvedorBase):
    __tablename__ = 'usuarios'
    funcionario = Column(Integer, primary_key=True)
    nome = Column(String)
    __table_args__ = {'extend_existing': True}