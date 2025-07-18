# app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database import LocalBase
import datetime

class User(LocalBase):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum('admin', 'viewer', name='user_roles'), nullable=False, default='viewer')
    created_at = Column(DateTime, default=datetime.datetime.now)