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


@router.get("/forms/{external_id_str}", response_model=frontend_schema.AttendanceWithAnswersResponse)
def get_answered_survey(
    external_id_str: str, # 1. MUDANÇA: Agora recebemos uma string
    db: Session = Depends(get_db_local)
):
    """
    Busca os detalhes e as respostas de um atendimento já finalizado,
    usando um ID no formato 'ATD...'.
    """
    # 2. LÓGICA PARA VALIDAR E EXTRAIR O NÚMERO DO ID
    if not external_id_str.upper().startswith("ATD"):
        raise HTTPException(
            status_code=400,
            detail="Formato de ID inválido. O ID deve começar com 'ATD'."
        )
    try:
        # Pega o que vem depois dos 3 primeiros caracteres ("ATD") e converte para inteiro
        numerical_id = int(external_id_str[3:])
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Formato de ID inválido. A parte numérica do ID é inválida."
        )

    # 3. Usa o ID numérico para buscar no banco (o resto da função não muda)
    attendance = crud_attendance.get_attendance_with_answers(db=db, external_id=numerical_id)

    if not attendance:
        raise HTTPException(status_code=404, detail=f"Atendimento com ID {numerical_id} não encontrado.")

    # Formata os dados do atendimento
    attendance_data = {
        "id": f"ATD{attendance.external_id}",
        "client_name": attendance.client_name,
        "technician": attendance.technician,
        "service_type": attendance.service_type,
        "status": attendance.status,
        "date_closed": attendance.date_closed
    }

    # Formata a lista de perguntas e respostas
    answered_questions_list = []
    for answer in attendance.answers:
        answered_questions_list.append({
            "question_text": answer.question.question_text,
            "answer_value": answer.answer_value
        })

    # Monta e retorna a resposta final
    return {
        "attendance": attendance_data,
        "answered_questions": answered_questions_list
    }