# app/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from .background_job import verificar_atendimentos_fechados, verificar_formularios_pendentes_para_lembrete
from .routers import submissions, frontend_api
from .crud import crud_form
from .schemas import form as form_schema
from .database import SessionLocal, LocalBase, engine_local
from .models import user, form, attendance


print("Criando tabelas no banco de dados, se necessário...")
LocalBase.metadata.create_all(bind=engine_local)
print("Tabelas prontas.")



# Define o gerenciador de ciclo de vida
@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Iniciando agendador de tarefas...")
    scheduler = BackgroundScheduler()

    # Adiciona a primeira tarefa: buscar novos atendimentos a cada minuto.
    scheduler.add_job(verificar_atendimentos_fechados, 'interval', seconds=60)

    # Adiciona a segunda tarefa: enviar lembretes a cada hora.
    scheduler.add_job(verificar_formularios_pendentes_para_lembrete, 'interval', hours=1)

    scheduler.start()

    yield

    print("Parando o agendador de tarefas...")
    scheduler.shutdown()


# Cria a instância principal do FastAPI, passando a função lifespan
app = FastAPI(
    lifespan=lifespan,
    title="API de Pesquisa de Satisfação - Newnet",
    description="API para receber e armazenar respostas do formulário de avaliação de atendimento.",
    version="1.0.0"
)

# Inclui o router das submissões para que as rotas fiquem ativas
app.include_router(submissions.router)
app.include_router(frontend_api.router)


@app.get("/", tags=["Root"])
def read_root():
    return {"status": "API de Pesquisa de Satisfação no ar!"}


# ROTA TEMPORÁRIA PARA CRIAR O PRIMEIRO FORMULÁRIO (pode manter ou remover depois do primeiro uso)
@app.post("/seed-initial-form/", tags=["Setup"])
def seed_initial_form():
    db = SessionLocal()
    form = crud_form.get_form(db, form_id=1)
    if form:
        db.close()
        return {"message": "O formulário inicial já existe."}

    form_data = form_schema.FormCreate(
        title="Formulário de Avaliação do Atendimento - Newnet",
        description="Avalie sua experiência com nosso atendimento.",
        questions=[
            form_schema.QuestionCreate(question_text="Como você avaliaria o atendimento que recebeu?", question_type='radio', display_order=1, options=[
                form_schema.QuestionOptionCreate(option_text='Excelente'), form_schema.QuestionOptionCreate(option_text='Bom'), form_schema.QuestionOptionCreate(option_text='Regular'), form_schema.QuestionOptionCreate(option_text='Ruim'), form_schema.QuestionOptionCreate(option_text='Péssimo'),
            ]),
            form_schema.QuestionCreate(question_text="O(a) atendente foi claro(a) e educado(a) durante o atendimento?", question_type='radio', display_order=2, options=[
                form_schema.QuestionOptionCreate(option_text='Sim'), form_schema.QuestionOptionCreate(option_text='Parcialmente'), form_schema.QuestionOptionCreate(option_text='Não'),
            ]),
            form_schema.QuestionCreate(question_text="Seu problema foi resolvido com este atendimento?", question_type='radio', display_order=3, options=[
                form_schema.QuestionOptionCreate(option_text='Sim, completamente'), form_schema.QuestionOptionCreate(option_text='Parcialmente'), form_schema.QuestionOptionCreate(option_text='Não foi resolvido'),
            ]),
            form_schema.QuestionCreate(question_text="Quanto tempo que levou para seu problema ser atendido/resolvido?", question_type='radio', display_order=4, options=[
                form_schema.QuestionOptionCreate(option_text='Imediatamente'), form_schema.QuestionOptionCreate(option_text='Até 30 minutos'), form_schema.QuestionOptionCreate(option_text='Entre 30 min e 2 horas'), form_schema.QuestionOptionCreate(option_text='Mais de 2 horas'), form_schema.QuestionOptionCreate(option_text='Ainda não foi resolvido'),
            ]),
            form_schema.QuestionCreate(question_text="Em uma escala de 0 a 10, qual a probabilidade de você recomendar a Newnet para um amigo ou familiar?", question_type='nps', display_order=5),
        ]
    )
    crud_form.create_form(db, form=form_data)
    db.close()
    return {"message": "Formulário inicial criado com sucesso!"}