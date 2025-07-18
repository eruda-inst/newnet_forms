# app/database.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

USUARIO_LOCAL = os.getenv("DB_LOCAL_USER")
SENHA_LOCAL = os.getenv("DB_LOCAL_PASSWORD")
HOST_LOCAL = os.getenv("DB_LOCAL_HOST")
PORTA_LOCAL = os.getenv("DB_LOCAL_PORT")
NOME_BANCO_LOCAL = os.getenv("DB_LOCAL_NAME")
DIALETO_LOCAL = os.getenv("DB_LOCAL_DIALETO")

SQLALCHEMY_LOCAL_DATABASE_URL = (
    f"{DIALETO_LOCAL}://{USUARIO_LOCAL}:{SENHA_LOCAL}"
    f"@{HOST_LOCAL}:{PORTA_LOCAL}/{NOME_BANCO_LOCAL}"
)

engine = create_engine(
    SQLALCHEMY_LOCAL_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
LocalBase = declarative_base()

USUARIO_PROVEDOR = os.getenv("DB_PROVEDOR_USUARIO")
SENHA_PROVEDOR = os.getenv("DB_PROVEDOR_SENHA")
HOST_PROVEDOR = os.getenv("DB_PROVEDOR_HOST")
PORTA_PROVEDOR = os.getenv("DB_PROVEDOR_PORT")
NOME_BANCO_PROVEDOR = os.getenv("DB_PROVEDOR_NOME_BANCO")
DIALETO_DO_BANCO = os.getenv("DB_PROVEDOR_DIALETO")

SQLALCHEMY_PROVEDOR_DATABASE_URL = (
    f"{DIALETO_DO_BANCO}://{USUARIO_PROVEDOR}:{SENHA_PROVEDOR}"
    f"@{HOST_PROVEDOR}:{PORTA_PROVEDOR}/{NOME_BANCO_PROVEDOR}"
)
engine_provedor = create_engine(SQLALCHEMY_PROVEDOR_DATABASE_URL)
SessionProvedor = sessionmaker(autocommit=False, autoflush=False, bind=engine_provedor)
ProvedorBase = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

        