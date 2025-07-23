# app/routers/admin_api.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.crud import crud_setting
from app.schemas import setting as setting_schema
from app.database import get_db_local
from app.crud import crud_form
from app.schemas import form as form_schema

router = APIRouter(
    tags=["Admin - Questions"]
)

@router.post("/questions", response_model=form_schema.QuestionUpdateResponse, status_code=status.HTTP_201_CREATED)
def create_new_question(
    question_payload: form_schema.NewQuestionRequest,
    db: Session = Depends(get_db_local)
):
    """
    Cria uma nova pergunta no formulário padrão (id=1).
    """
    FORM_ID_DEFAULT = 1
    
    # Chama a função CRUD para criar a pergunta no banco
    created_question = crud_form.create_question(
        db=db, form_id=FORM_ID_DEFAULT, question_in=question_payload
    )

    # Formata a resposta para o frontend
    response_data = {
        "id": f"q{created_question.id}",
        "question_text": created_question.question_text,
        "question_type": created_question.question_type,
        "options": [opt.option_text for opt in created_question.options]
    }
    
    return response_data


@router.put("/questions/{question_id_str}", response_model=form_schema.QuestionUpdateResponse)
def update_existing_question(
    question_id_str: str,
    question_payload: form_schema.QuestionUpdatePayload,
    db: Session = Depends(get_db_local)
):
    """
    Atualiza uma pergunta existente.
    """
    # 1. Converte o ID do frontend (ex: "q3") para um ID numérico (ex: 3)
    try:
        # Pega o número depois da letra 'q'
        question_id = int(question_id_str[1:])
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Formato de ID inválido. Deve ser 'q' seguido de um número.")

    # 2. Chama a função CRUD para fazer a atualização
    updated_question = crud_form.update_question(
        db=db, question_id=question_id, question_in=question_payload
    )

    # 3. Se o CRUD retornar None, significa que a pergunta não foi encontrada
    if updated_question is None:
        raise HTTPException(status_code=404, detail=f"Pergunta com id {question_id} não encontrada.")

    # 4. Formata e retorna a resposta de sucesso
    response_data = {
        "id": f"q{updated_question.id}",
        "question_text": updated_question.question_text,
        "question_type": updated_question.question_type,
        "options": [opt.option_text for opt in updated_question.options]
    }
    
    return response_data


@router.delete("/questions/{question_id_str}", status_code=status.HTTP_200_OK)
def delete_question(
    question_id_str: str,
    db: Session = Depends(get_db_local)
):
    """
    Desativa (soft delete) uma pergunta existente.
    """
    # 1. Converte o ID do frontend (ex: "q4") para um ID numérico (ex: 4)
    try:
        question_id = int(question_id_str[1:])
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Formato de ID inválido. Deve ser 'q' seguido de um número.")

    # 2. Chama a função CRUD para desativar a pergunta
    deactivated_question = crud_form.deactivate_question(db=db, question_id=question_id)

    # 3. Se o CRUD retornar None, a pergunta não foi encontrada ou já estava inativa
    if deactivated_question is None:
        raise HTTPException(status_code=404, detail=f"Pergunta ativa com id {question_id} não encontrada.")

    # 4. Retorna a mensagem de sucesso, como solicitado
    return {"message": f"Pergunta {question_id_str} deletada com sucesso."}


@router.get("/settings/sms", response_model=setting_schema.SettingResponse)
def get_sms_status(db: Session = Depends(get_db_local)):
    """Verifica se o envio de SMS está habilitado."""
    db_setting = crud_setting.get_setting(db, key="sms_enable")
    is_enabled = db_setting and db_setting.value.lower() == 'true'
    return {"key": "sms_enabled", "enabled": is_enabled}

@router.put("/settings/sms", response_model=setting_schema.SettingResponse)
def set_sms_status(
    status: setting_schema.SettingUpdate,
    db: Session = Depends(get_db_local)
):
    """Habilita ou desabilita o envio de SMS."""
    new_value = "True" if status.enabled else "False"
    db_setting = crud_setting.update_setting(db, key="sms_enable", value=new_value)
    return {"key": db_setting.key, "enabled": db_setting.value.lower() == 'true'}