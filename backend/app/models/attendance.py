# app/models/attendance.py
from sqlalchemy import Column, Integer, String, DateTime, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import LocalBase
import datetime

class Attendance(LocalBase):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(Integer, unique=True, index=True, nullable=True)
    
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    client_name = Column(String, nullable=False)
    
    technician = Column(String, nullable=True)
    service_type = Column(String, nullable=True)
    status = Column(Enum('Pendente', 'Recorrente', 'Respondido', 'Não Respondido', name='attendance_status'), nullable=False, default='Pendente')
    date_opened = Column(DateTime)
    date_closed = Column(DateTime)

    # Relacionamento: Um atendimento usa um formulário como template
    form = relationship("Form", back_populates="attendances")
    # Relacionamento: Um atendimento tem muitas respostas
    answers = relationship("Answer", back_populates="attendance", cascade="all, delete-orphan")


class Answer(LocalBase):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    attendance_id = Column(Integer, ForeignKey("attendances.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    answer_value = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.now)

    # Relacionamento: Uma resposta pertence a um atendimento
    attendance = relationship("Attendance", back_populates="answers")
    # Relacionamento: Uma resposta pertence a uma pergunta
    question = relationship("Question", back_populates="answers")