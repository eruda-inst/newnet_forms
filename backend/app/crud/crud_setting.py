# app/crud/crud_setting.py
from sqlalchemy.orm import Session
from app.models import setting as setting_model
from typing import Optional

def get_setting(db: Session, key: str) -> Optional[setting_model.Setting]:
    """Busca uma configuração pela chave."""
    return db.query(setting_model.Setting).filter(setting_model.Setting.key == key).first()

def update_setting(db: Session, key: str, value: str) -> setting_model.Setting:
    """Cria ou atualiza uma configuração."""
    db_setting = get_setting(db, key=key)
    if db_setting:
        # Se já existe, atualiza o valor
        db_setting.value = value
    else:
        # Se não existe, cria
        db_setting = setting_model.Setting(key=key, value=value)
        db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting