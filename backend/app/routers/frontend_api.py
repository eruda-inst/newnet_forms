# app/routers/frontend_api.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db_local
from app.crud import crud_attendance, crud_form
from app.schemas import frontend as frontend_schema

# Criamos um novo router com o prefixo /api
router = APIRouter(
    prefix="/api",
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