# app/crud/crud_form.py
from sqlalchemy.orm import Session
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