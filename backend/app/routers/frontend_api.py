# app/routers/frontend_api.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db_local, get_db_provedor
from app.crud import crud_attendance, crud_form
from app.schemas import frontend as frontend_schema

router = APIRouter(
    tags=["Frontend API"]
)

@router.get("/forms", response_model=List[frontend_schema.AttendanceResponse])
def get_attendances_for_frontend(db: Session = Depends(get_db_local)):
    """
    Retorna uma lista de todos os atendimentos formatada para o frontend.
    """
    attendances_data = crud_attendance.get_all_attendances_formatted(db)
    return attendances_data

@router.get("/questions", response_model=List[frontend_schema.QuestionResponse])
def get_questions_for_frontend(db: Session = Depends(get_db_local)):
    """
    Retorna a lista de perguntas do formulário padrão para o frontend.
    """
    questions_data = crud_form.get_questions_for_frontend(db)
    return questions_data


@router.get("/survey/{external_id}", response_model=frontend_schema.SurveyLoadResponse)
def get_survey_data(
    external_id: int,
    db_local: Session = Depends(get_db_local),
    db_provedor: Session = Depends(get_db_provedor)
):
    """
    Busca os dados de um atendimento e as perguntas do formulário associado.
    Se o atendimento não existir localmente, ele é criado sob demanda (Just-in-Time).
    """
    # 1. Usa a função "get or create" para garantir que o atendimento exista
    attendance = crud_attendance.get_or_create_attendance(
        db_local=db_local, db_provedor=db_provedor, external_id=external_id
    )

    if not attendance:
        raise HTTPException(status_code=404, detail="Atendimento não encontrado.")

    # 2. Busca as perguntas ativas do formulário associado ao atendimento
    questions_data = crud_form.get_questions_for_frontend(db=db_local, form_id=attendance.form_id)
    
    # 3. Formata os dados do atendimento para a resposta
    attendance_data_formatted = {
        "id": f"ATD{attendance.external_id}",
        "client_name": attendance.client_name,
        "technician": attendance.technician,
        "service_type": attendance.service_type,
        "status": attendance.status
    }

    # 4. Monta e retorna a resposta final
    return {
        "attendance": attendance_data_formatted,
        "questions": questions_data
    }

# ... (rotas existentes /forms e /questions) ...