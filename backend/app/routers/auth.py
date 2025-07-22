# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import crud, schemas, security
from app.database import get_db_local

router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=schemas.user.User, status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.user.UserCreate, db: Session = Depends(get_db_local)):
    """Cria um novo usuário."""
    user = crud.crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um usuário com este email.",
        )
    return crud.crud_user.create_user(db=db, user=user_in)


@router.post("/token", response_model=schemas.user.Token)
def login_for_access_token(
    db: Session = Depends(get_db_local),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Realiza o login e retorna um token de acesso."""
    user = crud.crud_user.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}