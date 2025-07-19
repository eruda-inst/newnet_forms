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
    dateOpened: datetime = Field(..., alias='date_opened')
    dateClosed: datetime = Field(..., alias='date_closed')
    status: str
    satisfaction: Optional[int] = None
    responses: List[AnswerResponse]

    class Config:
        orm_mode = True
        allow_population_by_field_name = True