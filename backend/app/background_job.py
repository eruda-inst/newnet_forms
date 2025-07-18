# app/background_job.py
import datetime
from sqlalchemy.orm import Session
from .database import SessionLocal, SessionProvedor
from .database import ProvedorBase
from sqlalchemy import Column, Integer, String, DateTime, Enum
from .models.avaliacao import Avaliacao
from .api import crud_avaliacao
from .services import enviar_sms_disparo_pro

class AtendimentoProvedor(ProvedorBase):
    __tablename__ = 'atendimentos' # NOME REAL DA TABELA NO BANCO DO PROVEDOR
    id = Column(Integer, primary_key=True)
    nome_cliente = Column(String)
    data_fechamento = Column(DateTime)
    status = Column(String)
    telefone = Column(String)
    
    # Isso impede que o SQLAlchemy tente modificar a tabela no outro banco
    __table_args__ = {'extend_existing': True}

    ultimo_check = datetime.datetime.now() - datetime.timedelta(hours=24)

def verificar_atendimentos_fechados():
    """
    Esta função é executada periodicamente para buscar atendimentos fechados
    e criar os formulários de pesquisa.
    """
    global ultimo_check
    
    db_provedor: Session = SessionProvedor()
    db_local: Session = SessionLocal()
    
    print(f"[{datetime.datetime.now()}] Verificando novos atendimentos fechados desde {ultimo_check}...")
    
    try:
        # 1. EXTRAÇÃO: Busca atendimentos fechados no banco do provedor desde a última verificação
        novos_atendimentos = db_provedor.query(AtendimentoProvedor).filter(
            AtendimentoProvedor.status == 'FECHADO', # Ajuste o filtro conforme sua regra
            AtendimentoProvedor.data_fechamento > ultimo_check
        ).all()

        if not novos_atendimentos:
            print("Nenhum atendimento novo encontrado.")
            return

        for atendimento in novos_atendimentos:
            print(f"Novo atendimento fechado encontrado: ID {atendimento.id}")
            
            # 2. CARGA: Verifica se o formulário já não existe e o cria no banco local
            # (Você precisará criar essa função no seu arquivo de CRUD)
            existe = crud_avaliacao.get_avaliacao_by_atendimento_id(db_local, id_atendimento=atendimento.id)
            if not existe:
                crud_avaliacao.create_blank_formulario(
                    db=db_local, 
                    id_atendimento=atendimento.id,
                    nome_cliente=atendimento.nome_cliente,
                    telefone_clinete=atendimento.telefone,
                    data_criacao=atendimento.data_fechamento
                )
                print(f"Formulário para o atendimento {atendimento.id} criado com sucesso.")

        # Atualiza o tempo da última verificação para o momento atual
        ultimo_check = datetime.datetime.now()

    finally:
        db_provedor.close()
        db_local.close()


def verificar_formularios_pendentes_para_lembrete():
    """
    Verifica formulários com mais de 24h sem resposta e envia um lembrete.
    """
    db_local: Session = SessionLocal()
    print(f"[{datetime.datetime.now()}] Verificando formulários pendentes para lembrete...")

    # Define o limite de tempo (24 horas atrás)
    limite_tempo = datetime.datetime.now() - datetime.timedelta(hours=24)

    try:
        # Busca formulários não respondidos, criados antes do limite de tempo,
        # e para os quais um lembrete ainda não foi enviado.
        formularios_para_lembrar = db_local.query(Avaliacao).filter(
            Avaliacao.respondido == False,
            Avaliacao.lembrete_enviado == False,
            Avaliacao.data_criacao_formulario <= limite_tempo
        ).all()

        if not formularios_para_lembrar:
            print("Nenhum formulário pendente para lembrar.")
            return

        for form in formularios_para_lembrar:
            mensagem = (f"Olá, {form.nome_cliente}. Notamos que você ainda não respondeu "
                        f"nossa pesquisa de satisfação sobre o atendimento {form.id_atendimento}. "
                        "Sua opinião é muito importante!")
            
            sucesso = enviar_sms_disparo_pro(
                telefone=form.telefone_cliente,
                mensagem=mensagem
            )

            # Se o SMS foi enviado com sucesso, atualiza o banco para não enviar de novo
            if sucesso:
                form.lembrete_enviado = True
                db_local.commit()

    finally:
        db_local.close()
