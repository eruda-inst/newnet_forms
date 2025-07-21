# app/crud/crud_form.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import form as form_model
from app.schemas import form as form_schema
from sqlalchemy.orm import joinedload
from typing import List

def get_form(db: Session, form_id: int):
    return db.query(form_model.Form).filter(form_model.Form.id == form_id).first()

def get_forms(db: Session, skip: int = 0, limit: int = 100):
    return db.query(form_model.Form).offset(skip).limit(limit).all()

def create_form(db: Session, form: form_schema.FormCreate):
    db_form = form_model.Form(
        title=form.title,
        description=form.description
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)

    for q_in in form.questions:
        db_question = form_model.Question(
            form_id=db_form.id,
            question_text=q_in.question_text,
            question_type=q_in.question_type,
            display_order=q_in.display_order
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)

        if q_in.options:
            for opt_in in q_in.options:
                db_option = form_model.QuestionOption(
                    question_id=db_question.id,
                    option_text=opt_in.option_text
                )
                db.add(db_option)
                db.commit()

    db.refresh(db_form)
    return db_form


def get_questions_for_frontend(db: Session, form_id: int = 1) -> List[dict]:
    """
    Busca as perguntas de um formulário padrão e formata para o frontend.
    """
    questions = db.query(form_model.Question).filter(form_model.Question.form_id == form_id).options(
        joinedload(form_model.Question.options)
    ).order_by(form_model.Question.display_order).all()

    results = []
    for q in questions:
        question_dict = {
            "id": f"q{q.id}",
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": [opt.option_text for opt in q.options] if q.options else None
        }
        results.append(question_dict)
        
    return results


def create_question(db: Session, form_id: int, question_in: form_schema.NewQuestionRequest) -> form_model.Question:
    """
    Cria uma única nova pergunta e a associa a um formulário.
    """
    # 1. Calcula a próxima ordem de exibição
    max_order = db.query(func.max(form_model.Question.display_order)).filter(
        form_model.Question.form_id == form_id
    ).scalar()
    next_order = (max_order or 0) + 1

    # 2. Cria o objeto da nova pergunta
    db_question = form_model.Question(
        form_id=form_id,
        question_text=question_in.question_text,
        question_type=question_in.question_type,
        display_order=next_order,
        is_active=True
    )
    db.add(db_question)
    db.flush() # Usa flush para obter o ID da nova pergunta antes do commit final

    # 3. Cria as opções, se houver
    if question_in.options:
        for opt_text in question_in.options:
            db.add(form_model.QuestionOption(question_id=db_question.id, option_text=opt_text))

    db.commit()
    db.refresh(db_question) # Atualiza o objeto com os dados do banco (incluindo as opções)
    
    return db_question

def update_question(db: Session, question_id: int, question_in: form_schema.QuestionUpdatePayload) -> Optional[form_model.Question]:
    """
    Atualiza uma pergunta existente no banco de dados.
    """
    # 1. Encontra a pergunta pelo seu ID numérico
    db_question = db.query(form_model.Question).filter(form_model.Question.id == question_id).first()

    if not db_question:
        return None # Retorna None se a pergunta não for encontrada

    # 2. Atualiza os campos da pergunta
    db_question.question_text = question_in.question_text
    db_question.question_type = question_in.question_type

    # 3. Atualiza as opções (apagando as antigas e recriando as novas)
    # Isso garante que a lista de opções fique sempre sincronizada.
    db.query(form_model.QuestionOption).filter(form_model.QuestionOption.question_id == question_id).delete()
    
    if question_in.options:
        for opt_text in question_in.options:
            db.add(form_model.QuestionOption(question_id=db_question.id, option_text=opt_text))

    db.commit()
    db.refresh(db_question)

    return db_question


def deactivate_question(db: Session, question_id: int) -> Optional[form_model.Question]:
    """
    Desativa uma pergunta (soft delete) mudando seu status para is_active = False.
    """
    # 1. Encontra a pergunta que está atualmente ativa
    db_question = db.query(form_model.Question).filter(
        form_model.Question.id == question_id,
        form_model.Question.is_active == True
    ).first()

    if not db_question:
        return None # Retorna None se a pergunta não existe ou já está inativa

    # 2. Muda o status para inativo
    db_question.is_active = False
    
    db.commit()
    db.refresh(db_question)

    return db_question




