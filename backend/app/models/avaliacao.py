# app/models/avaliacao.py
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from app.database import LocalBase

class Avaliacao(LocalBase):
    __tablename__ = "avaliacoes"

    id = Column(Integer, primary_key=True, index=True)
    id_atendimento = Column(Integer, unique=True, index=True, nullable=False)
    nome_cliente = Column(String)
    telefone_cliente = Column(String, nullable=True)
    

    avaliacao_geral = Column(String, index=True, nullable=True)
    atendente_claro_educado = Column(String, nullable=True)
    problema_resolvido = Column(String, nullable=True)
    tempo_resolucao = Column(String, nullable=True)
    nps = Column(Integer, index=True, nullable=True)

    respondido = Column(Boolean, default=False)
    lembrete_enviado = Column(Boolean, default=False) # <-- NOVO CAMPO
    data_envio = Column(DateTime, nullable=True)
    data_criacao_formulario = Column(DateTime)