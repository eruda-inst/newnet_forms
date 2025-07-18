# app/crud/crud_user.py
from sqlalchemy.orm import Session
from app.models import user as user_model
from app.schemas import user as user_schema

def get_user_by_email(db: Session, email: str):
    return db.query(user_model.User).filter(user_model.User.email == email).first()

def create_user(db: Session, user: user_schema.UserCreate):
    # Em um cenário real, a senha seria "hasheada" aqui antes de salvar
    # Ex: fake_hashed_password = user.password + "notreallyhashed"
    db_user = user_model.User(
        email=user.email,
        name=user.name,
        password_hash=user.password # Lembre-se de hashear a senha!
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user