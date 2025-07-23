# app/background_job.py
import os
import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, SessionProvedor
# Importando os novos CRUDs e o serviço de SMS
from app.crud import crud_attendance, crud_setting
from app.services import enviar_sms_disparo_pro
from app.models import provedor as provedor_model

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
    data_abertura = Column(DateTime)
    id_tecnico = Column(Integer)
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

class TecnicoProvedor(ProvedorBase):
    __tablename__ = 'usuarios'
    funcionario = Column(Integer, primary_key=True)
    nome = Column(String)
    __table_args__ = {'extend_existing': True}

# Variável para guardar a data da última verificação
ultimo_check = datetime.datetime.now() - datetime.timedelta(minutes=5)

def verificar_atendimentos_fechados():
    """
    Busca atendimentos fechados no banco do provedor, cria os registros localmente
    e já envia o SMS com o link da pesquisa.
    """
    global ultimo_check
    db_provedor: Session = SessionProvedor()
    db_local: Session = SessionLocal()
    
    print(f"[{datetime.datetime.now()}] Verificando novos atendimentos fechados desde {ultimo_check}...")
    
    STATUS_FECHADO = 'F' 
    
    try:
        # --- AQUI ESTÁ A CONSULTA COMPLETA E CORRIGIDA ---
        query = db_provedor.query(
            provedor_model.ChamadoProvedor.id,
            provedor_model.ClienteProvedor.razao,
            provedor_model.ClienteProvedor.telefone_celular,
            provedor_model.AssuntoProvedor.assunto,
            provedor_model.ChamadoProvedor.data_fechamento,
            provedor_model.ChamadoProvedor.data_abertura,
            provedor_model.TecnicoProvedor.nome
        ).select_from(provedor_model.ChamadoProvedor).join(
            provedor_model.ClienteProvedor, provedor_model.ChamadoProvedor.id_cliente == provedor_model.ClienteProvedor.id
        ).join(
            provedor_model.AssuntoProvedor, provedor_model.ChamadoProvedor.id_assunto == provedor_model.AssuntoProvedor.id
        ).outerjoin(
            provedor_model.TecnicoProvedor, provedor_model.ChamadoProvedor.id_tecnico == provedor_model.TecnicoProvedor.funcionario
        ).filter(
            provedor_model.ChamadoProvedor.status == STATUS_FECHADO,
            provedor_model.ChamadoProvedor.data_fechamento > ultimo_check
        )

        novos_atendimentos = query.all()

        if not novos_atendimentos:
            print("Nenhum atendimento novo encontrado.")
            return

        for atendimento in novos_atendimentos:
            (chamado_id, cliente_razao, cliente_telefone, assunto_nome, 
             data_fechamento, data_abertura, tecnico_nome) = atendimento
            
            existe = db_local.query(crud_attendance.attendance_model.Attendance).filter_by(external_id=chamado_id).first()
            if not existe:
                print(f"Novo atendimento fechado encontrado: ID Externo {chamado_id}")
                
                novo_atendimento = crud_attendance.create_attendance(
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
                print(f"Registro de atendimento para {chamado_id} criado com sucesso.")

                sms_setting = crud_setting.get_setting(db_local, key="sms_enable")
                if sms_setting and sms_setting.value.lower() == 'true':
                    frontend_url = os.getenv("FRONTEND_URL")
                    link_pesquisa = f"{frontend_url}/ATD{novo_atendimento.external_id}"
                    mensagem_sms = (f"Olá, {novo_atendimento.client_name}. Por favor avalie seu atendimento em {link_pesquisa} é muito importante para nós obrigado!")
                    if novo_atendimento.telefone_cliente:
                        enviar_sms_disparo_pro(
                            telefone=novo_atendimento.telefone_cliente,
                            mensagem=mensagem_sms
                        )
                    else:
                        print(f"Atendimento {chamado_id} não possui telefone. SMS não enviado.")
                else:
                    print("Envio de SMS está DESABILITADO.")


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
        # Precisamos de um modelo de atendimento aqui, vamos usar um placeholder
        
        atendimentos_para_lembrar = db_local.query(crud_attendance.attendance_model.Attendance).filter(
            crud_attendance.attendance_model.Attendance.status == 'Pendente',
            crud_attendance.attendance_model.Attendance.lembrete_enviado == False,
            crud_attendance.attendance_model.Attendance.date_closed <= limite_tempo
        ).all()

        if not atendimentos_para_lembrar:
            print("Nenhum atendimento pendente para lembrar.")
            return

        for atendimento in atendimentos_para_lembrar:
            
            sms_setting = crud_setting.get_setting(db_local, key="sms_enable")
            if sms_setting and sms_setting.value.lower() == 'true':
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
            
            else:
                print("Envio de SMS de lembrete está DESABILITADO.")

    finally:
        db_local.close()