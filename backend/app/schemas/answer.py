# app/schemas/answer.py
from pydantic import BaseModel
from typing import List

# Define a estrutura de uma única resposta
class AnswerCreate(BaseModel):
    question_id: int
    answer_value: str

# Define a estrutura do payload que o frontend enviará:
# uma lista de respostas para um atendimento específico.
class SubmissionPayload(BaseModel):
    attendance_id: int
    answers: List[AnswerCreate]


# Schema para exibir uma resposta já salva no banco
class Answer(AnswerCreate):
    id: int
    
    class Config:
        orm_mode = True