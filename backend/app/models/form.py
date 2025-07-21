# app/models/form.py
from sqlalchemy import Column, Integer, String, DateTime, Enum, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import LocalBase
import datetime

class Form(LocalBase):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    # Relacionamento: Um formulário tem muitas perguntas
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan")
    # Relacionamento: Um formulário é usado em muitos atendimentos
    attendances = relationship("Attendance", back_populates="form")


class Question(LocalBase):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum('nps', 'textarea', 'radio', 'file', 'text', name='question_types'), nullable=False)
    display_order = Column(Integer, default=0)

    is_active = Column(Boolean, default=True, nullable=False)

    # Relacionamento: Uma pergunta pertence a um formulário
    form = relationship("Form", back_populates="questions")
    # Relacionamento: Uma pergunta tem muitas opções (para tipo 'radio')
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    # Relacionamento: Uma pergunta pode ter muitas respostas
    answers = relationship("Answer", back_populates="question")


class QuestionOption(LocalBase):
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    option_text = Column(String, nullable=False)

    # Relacionamento: Uma opção pertence a uma pergunta
    question = relationship("Question", back_populates="options")