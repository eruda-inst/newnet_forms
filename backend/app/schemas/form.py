# app/schemas/form.py
from pydantic import BaseModel, Field
from typing import List, Optional



class QuestionUpdatePayload(BaseModel):
    question_text: str
    question_type: str
    options: List[str] = []

class QuestionUpdateResponse(BaseModel):
    id: str
    question_text: str
    question_type: str
    options: List[str] = []

class Config:
    orm_mode = True

# --- Schemas para rota post ---

class NewQuestionRequest(BaseModel):
    question_text: str
    question_type: str
    options: List[str] = []


# --- Schemas para Opções de Pergunta ---
class QuestionOptionBase(BaseModel):
    option_text: str

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOption(QuestionOptionBase):
    id: int

    class Config:
        orm_mode = True


# --- Schemas para Perguntas ---
class QuestionBase(BaseModel):
    question_text: str
    question_type: str
    display_order: int

class QuestionCreate(QuestionBase):
    options: Optional[List[QuestionOptionCreate]] = None

# Schema para exibir uma pergunta com suas opções
class Question(QuestionBase):
    id: int
    options: List[QuestionOption] = []

    class Config:
        orm_mode = True


# --- Schemas para o Formulário Principal ---
class FormBase(BaseModel):
    title: str
    description: Optional[str] = None

class FormCreate(FormBase):
    questions: List[QuestionCreate]

# Schema para exibir um formulário completo com todas as suas perguntas e opções
class Form(FormBase):
    id: int
    questions: List[Question] = []

    class Config:
        orm_mode = True