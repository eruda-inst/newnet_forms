# app/crud/crud_attendance.py
from sqlalchemy.orm import Session, joinedload
from app.models import attendance as attendance_model
from app.models import provedor as provedor_model
from app.schemas import answer as answer_schema
import datetime
from app.models import attendance as attendance_model, form as form_model
from typing import List, Optional

# --- Funções para Atendimentos ---

def get_attendance(db: Session, attendance_id: int):
    return db.query(attendance_model.Attendance).filter(attendance_model.Attendance.id == attendance_id).first()

def create_attendance(db: Session, external_id: int, form_id: int, client_name: str, technician: str, service_type: str, date_opened: datetime, date_closed: datetime, telefone_cliente: str): # Adicionei telefone aqui
    """
    Cria um novo registro de atendimento, usado pela tarefa de fundo.
    """
    db_attendance = attendance_model.Attendance(
        external_id=external_id,
        form_id=form_id,
        client_name=client_name,
        technician=technician,
        service_type=service_type,
        status='Pendente',
        date_opened=date_opened,
        date_closed=date_closed,
        telefone_cliente=telefone_cliente
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
    
    return db_attendance

def get_all_attendances_formatted(db: Session) -> List[dict]:
    """
    Busca todos os atendimentos e formata a saída para o frontend.
    """
    attendances = db.query(attendance_model.Attendance).options(
        joinedload(attendance_model.Attendance.answers).joinedload(attendance_model.Answer.question)
    ).order_by(attendance_model.Attendance.id.desc()).all()

    results = []
    for att in attendances:
        responses_list = []
        satisfaction_score = None
        
        for ans in att.answers:
            # Formata a resposta
            responses_list.append({
                "questionId": f"q{ans.question.id}",
                "answer": ans.answer_value
            })
            # Se a pergunta for do tipo NPS, guarda o valor para o campo 'satisfaction'
            if ans.question.question_type == 'nps':
                try:
                    satisfaction_score = int(ans.answer_value)
                except (ValueError, TypeError):
                    satisfaction_score = None

        result_dict = {
            "id": f"ATD{att.external_id}",
            "client_name": att.client_name,
            "technician": att.technician,
            "service_type": att.service_type,
            "date_opened": att.date_opened,
            "date_closed": att.date_closed,
            "status": att.status,
            "satisfaction": satisfaction_score,
            "responses": responses_list
        }
        results.append(result_dict)
    
    return results


def get_or_create_attendance(db_local: Session, db_provedor: Session, external_id: int) -> Optional[attendance_model.Attendance]:
    """
    Busca um atendimento no banco local. Se não encontrar, busca no banco
    do provedor e o cria localmente (lógica Just-in-Time).
    """
    # 1. Tenta encontrar no banco local primeiro (o caso mais comum)
    db_attendance = db_local.query(attendance_model.Attendance).filter(
        attendance_model.Attendance.external_id == external_id
    ).first()

    if db_attendance:
        return db_attendance

    # 2. Se não encontrou, busca no banco do provedor (o caso da "race condition")
    print(f"Atendimento {external_id} não encontrado localmente. Buscando no provedor...")
    atendimento_provedor = db_provedor.query(
        provedor_model.ChamadoProvedor.id, 
        provedor_model.ClienteProvedor.razao, 
        provedor_model.ClienteProvedor.telefone_celular,
        provedor_model.AssuntoProvedor.assunto, 
        provedor_model.ChamadoProvedor.data_fechamento,
        provedor_model.ChamadoProvedor.data_abertura, 
        provedor_model.TecnicoProvedor.nome
    ).join(
        provedor_model.ClienteProvedor, provedor_model.ChamadoProvedor.id_cliente == provedor_model.ClienteProvedor.id
    ).join(
        provedor_model.AssuntoProvedor, provedor_model.ChamadoProvedor.id_assunto == provedor_model.AssuntoProvedor.id
    ).outerjoin(
        provedor_model.TecnicoProvedor, provedor_model.ChamadoProvedor.id_tecnico == provedor_model.TecnicoProvedor.funcionario
    ).filter(provedor_model.ChamadoProvedor.id == external_id).first()

    if not atendimento_provedor:
        return None

    print(f"Atendimento {external_id} encontrado no provedor. Criando localmente...")
    (chamado_id, cliente_razao, cliente_telefone, assunto_nome, 
     data_fechamento, data_abertura, tecnico_nome) = atendimento_provedor

    return create_attendance(
        db=db_local,
        external_id=chamado_id,
        form_id=1,
        client_name=cliente_razao,
        technician=tecnico_nome,
        service_type=assunto_nome,
        date_opened=data_abertura,
        date_closed=data_fechamento,
        telefone_cliente=cliente_telefone
    )

