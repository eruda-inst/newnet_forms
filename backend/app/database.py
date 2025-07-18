# app/database.py

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Carrega as variáveis do arquivo .env para o ambiente da aplicação
# Esta linha deve ser chamada antes de qualquer acesso a os.getenv()
load_dotenv()

# --- SEÇÃO 1: Conexão com o Banco de Dados LOCAL (PostgreSQL no Docker) ---
# Esta é a base de dados da nossa própria aplicação, onde salvamos os formulários e respostas.

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

# Criando o "motor" de conexão para o banco local
engine_local = create_engine(SQLALCHEMY_LOCAL_DATABASE_URL)

# Criando a fábrica de sessões para o banco local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_local)

# Criando a classe Base para os nossos modelos ORM locais (User, Form, etc.)
LocalBase = declarative_base()


# --- SEÇÃO 2: Conexão com o Banco de Dados do PROVEDOR (MariaDB Externo) ---
# Esta é a base de dados do sistema principal, de onde apenas lemos os dados dos atendimentos.

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

# Criando o "motor" de conexão para o banco do provedor
engine_provedor = create_engine(SQLALCHEMY_PROVEDOR_DATABASE_URL)

# Criando a fábrica de sessões para o banco do provedor
SessionProvedor = sessionmaker(autocommit=False, autoflush=False, bind=engine_provedor)

# Criando uma Base separada para os modelos do banco do provedor (ChamadoProvedor, etc.)
ProvedorBase = declarative_base()


# --- SEÇÃO 3: Dependência para a API ---
# Esta função será usada nas nossas rotas da API para injetar uma sessão do banco LOCAL.

def get_db_local():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()