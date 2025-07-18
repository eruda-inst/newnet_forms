# app/crud/crud_attendance.py
from sqlalchemy.orm import Session
from app.models import attendance as attendance_model
from app.schemas import answer as answer_schema
import datetime

# --- Funções para Atendimentos ---

def get_attendance(db: Session, attendance_id: int):
    return db.query(attendance_model.Attendance).filter(attendance_model.Attendance.id == attendance_id).first()

def create_attendance(db: Session, external_id: int, form_id: int, client_name: str, technician: str, service_type: str, date_opened: datetime, date_closed: datetime, telefone_cliente: str): # Adicionei telefone aqui
    """
    Cria um novo registro de atendimento, usado pela tarefa de fundo.
    """
    db_attendance = attendance_model.Attendance(
        external_id=external_id, # <-- ADICIONE ESTA LINHA
        form_id=form_id,
        client_name=client_name,
        technician=technician,
        service_type=service_type,
        status='Pendente',
        date_opened=date_opened,
        date_closed=date_closed,
        telefone_cliente=telefone_cliente # Adicionei esta linha também
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


# --- Funções para Respostas ---

def create_submission(db: Session, submission: answer_schema.SubmissionPayload):
    """
    Salva uma submissão completa de respostas de um cliente.
    """
    # 1. Encontra o atendimento correspondente
    db_attendance = get_attendance(db, attendance_id=submission.attendance_id)
    if not db_attendance:
        return None # Ou levanta um erro

    # 2. Itera sobre cada resposta no payload e a salva no banco
    saved_answers = []
    for answer_in in submission.answers:
        db_answer = attendance_model.Answer(
            attendance_id=submission.attendance_id,
            question_id=answer_in.question_id,
            answer_value=answer_in.answer_value,
            submitted_at=datetime.datetime.now()
        )
        db.add(db_answer)
        saved_answers.append(db_answer)
    
    # 3. Atualiza o status do atendimento para 'Respondido'
    db_attendance.status = 'Respondido'
    
    db.commit()
    # Não precisa de refresh em cada resposta individualmente,
    # o commit salva todas as alterações na transação.
    
    return db_attendance