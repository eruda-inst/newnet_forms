# app/routers/submissions.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Importando os novos schemas e CRUDs
from app.schemas import answer as answer_schema
from app.crud import crud_attendance
from app.database import get_db_local # Importante: usar a função que obtém o DB local

# O nome do nosso router
router = APIRouter(
    prefix="/submissions",   # Prefixo para todas as rotas neste arquivo
    tags=["Submissions"]     # Agrupamento na documentação do Swagger
)

@router.post("/", status_code=201)
def submit_answers(
    submission_payload: answer_schema.SubmissionPayload,
    db: Session = Depends(get_db_local)
):
    """
    Recebe e processa a submissão de respostas de um formulário por um cliente.
    
    O corpo da requisição deve conter:
    - `attendance_id`: O ID do atendimento que está sendo respondido.
    - `answers`: Uma lista de objetos, cada um com `question_id` e `answer_value`.
    """
    # Verifica se o atendimento para o qual as respostas estão sendo enviadas realmente existe
    # e não foi respondido ainda.
    attendance = crud_attendance.get_attendance(db, attendance_id=submission_payload.attendance_id)
    
    if not attendance:
        raise HTTPException(
            status_code=404,
            detail=f"Atendimento com ID {submission_payload.attendance_id} não encontrado."
        )
        
    if attendance.status == 'Respondido':
        raise HTTPException(
            status_code=400,
            detail="Este formulário já foi respondido."
        )

    # Chama a função CRUD para salvar todas as respostas e atualizar o atendimento
    crud_attendance.create_submission(db=db, submission=submission_payload)
    
    return {"message": "Pesquisa respondida com sucesso!"}