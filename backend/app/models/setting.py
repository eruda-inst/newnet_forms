# app/models/setting.py
from sqlalchemy import Column, String
from app.database import LocalBase

class Setting(LocalBase):
    __tablename__ = "settings"

    # A chave da configuração, ex: "sms_enabled"
    key = Column(String, primary_key=True, index=True)
    # O valor da configuração, ex: "True" ou "False"
    value = Column(String, nullable=False)