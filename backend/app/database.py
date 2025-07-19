# app/database.py

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# Conexão com o Banco de Dados LOCAL
# Lendo as variáveis de ambiente para o banco de dados local
USUARIO_LOCAL = os.getenv("DB_LOCAL_USER")
SENHA_LOCAL = os.getenv("DB_LOCAL_PASSWORD")
HOST_LOCAL = os.getenv("DB_LOCAL_HOST")
PORTA_LOCAL = os.getenv("DB_LOCAL_PORT")
NOME_BANCO_LOCAL = os.getenv("DB_LOCAL_NAME")
DIALETO_LOCAL = os.getenv("DB_LOCAL_DIALETO")

# Montando a URL de conexão para o PostgreSQL
SQLALCHEMY_LOCAL_DATABASE_URL = (
    f"{DIALETO_LOCAL}://{USUARIO_LOCAL}:{SENHA_LOCAL}"
    f"@{HOST_LOCAL}:{PORTA_LOCAL}/{NOME_BANCO_LOCAL}"
)

engine_local = create_engine(SQLALCHEMY_LOCAL_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_local)
LocalBase = declarative_base()


# Conexão com o Banco de Dados do PROVEDOR
# Lendo as variáveis de ambiente para o banco de dados do provedor
USUARIO_PROVEDOR = os.getenv("DB_PROVEDOR_USUARIO")
SENHA_PROVEDOR = os.getenv("DB_PROVEDOR_SENHA")
HOST_PROVEDOR = os.getenv("DB_PROVEDOR_HOST")
PORTA_PROVEDOR = os.getenv("DB_PROVEDOR_PORT")
NOME_BANCO_PROVEDOR = os.getenv("DB_PROVEDOR_NOME_BANCO")
DIALETO_PROVEDOR = os.getenv("DB_PROVEDOR_DIALETO")

# Montando a URL de conexão para o MariaDB
SQLALCHEMY_PROVEDOR_DATABASE_URL = (
    f"{DIALETO_PROVEDOR}://{USUARIO_PROVEDOR}:{SENHA_PROVEDOR}"
    f"@{HOST_PROVEDOR}:{PORTA_PROVEDOR}/{NOME_BANCO_PROVEDOR}"
)

engine_provedor = create_engine(SQLALCHEMY_PROVEDOR_DATABASE_URL)
SessionProvedor = sessionmaker(autocommit=False, autoflush=False, bind=engine_provedor)
ProvedorBase = declarative_base()


# Dependência para a API
# Esta função será usada nas nossas rotas da API para injetar uma sessão do banco LOCAL.
def get_db_local():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()