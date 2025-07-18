# app/routers/avaliacoes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.api import crud_avaliacao
from app.schemas import avaliacao as schemas

router = APIRouter(
    prefix="/avaliacoes", 
    tags=["Avaliações"] 
)

@router.post("/{id_atendimento}", response_model=schemas.Avaliacao)
def submeter_avaliacao(
    id_atendimento: int, 
    avaliacao: schemas.AvaliacaoCreate, 
    db: Session = Depends(get_db)
):
    """
    Recebe e salva uma nova avaliação de atendimento.
    """

    db_avaliacao = crud_avaliacao.get_avaliacao_by_atendimento_id(db, id_atendimento=id_atendimento)
    if db_avaliacao:
        raise HTTPException(status_code=400, detail="Uma avaliação para este atendimento já foi enviada.")
    
    return crud_avaliacao.create_avaliacao(db=db, id_atendimento=id_atendimento, avaliacao=avaliacao)
    
