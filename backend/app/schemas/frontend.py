# app/schemas/frontend.py
from pydantic import BaseModel, Field, computed_field
from typing import List, Optional, Any
from datetime import datetime

# --- Schemas para a rota GET /api/questions ---

class QuestionResponse(BaseModel):
    id: str 
    text: str = Field(..., alias='question_text')
    type: str = Field(..., alias='question_type')
    options: Optional[List[str]] = None
    display_order: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


# --- Schemas para a rota GET /api/forms ---

class AnswerResponse(BaseModel):
    questionId: str 
    answer: Any

class AttendanceResponse(BaseModel):
    id: str
    clientName: str = Field(..., alias='client_name')
    technician: Optional[str] = None
    serviceType: str = Field(..., alias='service_type')
    dateOpened: Optional[datetime] = Field(None, alias='date_opened')
    dateClosed: Optional[datetime] = Field(None, alias='date_closed')
    status: str
    satisfaction: Optional[int] = None
    responses: List[AnswerResponse]

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class AttendanceData(BaseModel):
    id: str
    clientName: str = Field(..., alias='client_name')
    technician: Optional[str] = None
    serviceType: str = Field(..., alias='service_type')
    status: str
    dateClosed: Optional[datetime] = Field(None, alias='date_closed')


    class Config:
        orm_mode = True
        allow_population_by_field_name = True

# O schema completo da resposta, combinando dados do atendimento e as perguntas
class SurveyLoadResponse(BaseModel):
    attendance: AttendanceData
    questions: List[QuestionResponse]

class AnsweredQuestionResponse(BaseModel):
    # Combina a pergunta e a resposta em um único objeto
    question_text: str
    answer_value: str

class AttendanceWithAnswersResponse(BaseModel):
    # Reutilizamos o schema de dados do atendimento
    attendance: AttendanceData
    # E adicionamos a lista de perguntas e respostas
    answered_questions: List[AnsweredQuestionResponse]