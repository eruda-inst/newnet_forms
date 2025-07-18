# app/crud/crud_avaliacao.py
from sqlalchemy.orm import Session
import datetime
from app.models import avaliacao as models
from app.schemas import avaliacao as schemas

def get_avaliacao_por_atendimento_id(db: Session, id_atendimento: int):
    return db.query(models.Avaliacao).filter(models.Avaliacao.id_atendimento == id_atendimento).first()


def create_avaliacao(db: Session, id_atendimento: int, avaliacao: schemas.AvaliacaoCreate):
    db_avaliacao = models.Avaliacao(
        id_atendimento=id_atendimento,
        avaliacao_geral=avaliacao.avaliacao_geral.value,
        atendente_claro_educado=avaliacao.atendente_claro_educado.value,
        problema_resolvido=avaliacao.problema_resolvido.value,
        tempo_resolucao=avaliacao.tempo_resolucao.value,
        nps=avaliacao.nps,
        respondido=True,
        data_envio=datetime.datetime.now()
    )

    db.add(db_avaliacao)
    db.commit()
    db.refresh(db_avaliacao)
    return db_avaliacao

