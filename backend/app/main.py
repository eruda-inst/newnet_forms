# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routers import avaliacoes
from app.database import engine
from app.models import avaliacao as model_avaliacao
from apscheduler.schedulers.background import BackgroundScheduler
from .background_job import verificar_atendimentos_fechados, verificar_formularios_pendentes_para_lembrete

model_avaliacao.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando agendador de tarefas...")
    scheduler = BackgroundScheduler()
    #tarefa 1
    scheduler.add_job(verificar_atendimentos_fechados, 'interval', seconds=60)
    #tarefa 2
    scheduler.add_job(verificar_formularios_pendentes_para_lembrete, 'interval', hours=1)
    scheduler.start()

    yield

    print("Parando o agendador de tarefas...")
    scheduler.shutdown()

app = FastAPI (    
    lifespan=lifespan,
    title="API de Pesquisa de Satisfação - Newnet",
    description="API para receber e armazenar respostas do formulário de avaliação de atendimento.",
    version="1.0.0"
    )



app.include_router(avaliacoes.router)

@app.get("/", tags=["Root"])
def read_root():
    return {"status": "API de Pesquisa de Satisfação no ar!"}