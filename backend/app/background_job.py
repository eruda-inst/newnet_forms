# app/background_job.py

import datetime
from sqlalchemy.orm import Session, aliased
from app.database import SessionLocal, SessionProvedor

# Importando os novos CRUDs e o serviço de SMS
from app.crud import crud_attendance
from app.services import enviar_sms_disparo_pro

# Modelos para ler do banco de dados do provedor (MariaDB)
from .database import ProvedorBase
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey

# --- Definição dos Modelos do Banco do Provedor ---

class ChamadoProvedor(ProvedorBase):
    __tablename__ = 'su_oss_chamado'
    id = Column(Integer, primary_key=True)
    id_cliente = Column(Integer, ForeignKey('cliente.id'))
    id_assunto = Column(Integer, ForeignKey('su_oss_assunto.id'))
    data_fechamento = Column(DateTime)
    # Assumindo que a coluna de status se chama 'status' e o valor para fechado é 'F'
    status = Column(String)
    __table_args__ = {'extend_existing': True}

class ClienteProvedor(ProvedorBase):
    __tablename__ = 'cliente'
    id = Column(Integer, primary_key=True)
    razao = Column(String)
    telefone_celular = Column(String)
    __table_args__ = {'extend_existing': True}

class AssuntoProvedor(ProvedorBase):
    __tablename__ = 'su_oss_assunto'
    id = Column(Integer, primary_key=True)
    assunto = Column(String)
    __table_args__ = {'extend_existing': True}


# Variável para guardar a data da última verificação
ultimo_check = datetime.datetime.now() - datetime.timedelta(minutes=5)

def verificar_atendimentos_fechados():
    """
    Busca atendimentos fechados no banco do provedor, unindo as tabelas
    necessárias, e cria os registros em nosso banco local.
    """
    global ultimo_check
    db_provedor: Session = SessionProvedor()
    db_local: Session = SessionLocal()
    
    print(f"[{datetime.datetime.now()}] Verificando novos atendimentos fechados desde {ultimo_check}...")
    
    # !!! CONFIRME O VALOR PARA O STATUS DE FECHADO !!!
    STATUS_FECHADO = 'F' 
    
    try:
        # Construindo a consulta com JOIN
        query = db_provedor.query(
            ChamadoProvedor.id,
            ClienteProvedor.razao,
            ClienteProvedor.telefone_celular,
            AssuntoProvedor.assunto,
            ChamadoProvedor.data_fechamento
        ).join(
            ClienteProvedor, ChamadoProvedor.id_cliente == ClienteProvedor.id
        ).join(
            AssuntoProvedor, ChamadoProvedor.id_assunto == AssuntoProvedor.id
        ).filter(
            ChamadoProvedor.status == STATUS_FECHADO,
            ChamadoProvedor.data_fechamento > ultimo_check
        )

        novos_atendimentos = query.all()

        if not novos_atendimentos:
            print("Nenhum atendimento novo encontrado.")
            return

        for atendimento in novos_atendimentos:
            # Desempacotando os resultados da tupla
            (chamado_id, cliente_razao, cliente_telefone, assunto_nome, data_fechamento) = atendimento
            
            # Verifica se já não criamos um registro para este atendimento
            existe = db_local.query(crud_attendance.attendance_model.Attendance).filter_by(external_id=chamado_id).first()
            if not existe:
                print(f"Novo atendimento fechado encontrado: ID Externo {chamado_id}")
                crud_attendance.create_attendance(
                    db=db_local,
                    external_id=chamado_id,
                    form_id=1,
                    client_name=cliente_razao,
                    technician=None, # Não temos essa informação agora
                    service_type=assunto_nome,
                    date_opened=None, # Não temos essa informação agora
                    date_closed=data_fechamento,
                    telefone_cliente=cliente_telefone
                )
                print(f"Registro de atendimento para {chamado_id} criado com sucesso.")

        ultimo_check = datetime.datetime.now()

    finally:
        db_provedor.close()
        db_local.close()


def verificar_formularios_pendentes_para_lembrete():
    """
    Verifica atendimentos com mais de 24h sem resposta e envia um lembrete.
    """
    db_local: Session = SessionLocal()
    print(f"[{datetime.datetime.now()}] Verificando atendimentos pendentes para lembrete...")

    limite_tempo = datetime.datetime.now() - datetime.timedelta(hours=24)

    try:
        # Busca atendimentos no status 'Pendente', criados antes do limite de tempo,
        # e para os quais um lembrete ainda não foi enviado.
        atendimentos_para_lembrar = db_local.query(crud_attendance.attendance_model.Attendance).filter(
            crud_attendance.attendance_model.Attendance.status == 'Pendente',
            crud_attendance.attendance_model.Attendance.lembrete_enviado == False,
            crud_attendance.attendance_model.Attendance.date_closed <= limite_tempo
        ).all()

        if not atendimentos_para_lembrar:
            print("Nenhum atendimento pendente para lembrar.")
            return

        for atendimento in atendimentos_para_lembrar:
            mensagem = (f"Olá, {atendimento.client_name}. Notamos que você ainda não respondeu "
                        f"nossa pesquisa de satisfação sobre o atendimento {atendimento.external_id}. "
                        "Sua opinião é muito importante!")
            
            sucesso = enviar_sms_disparo_pro(
                telefone=atendimento.telefone_cliente,
                mensagem=mensagem
            )

            if sucesso:
                atendimento.lembrete_enviado = True
                db_local.commit()
                print(f"Lembrete enviado para o atendimento {atendimento.external_id}")

    finally:
        db_local.close()