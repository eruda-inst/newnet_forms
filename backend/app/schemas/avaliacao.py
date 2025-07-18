# app/schemas/avaliacao.py
from pydantic import BaseModel, Field
from enum import Enum
import datetime

class AvaliacaoGeralEnum(str, Enum):
    excelente = "Excelente"
    bom = "Bom"
    regular = "Regular"
    ruim = "Ruim"
    pessimo = "Péssimo"

class ClarezaEducacaoEnum(str, Enum):
    sim = "Sim"
    parcialmente = "Parcialmente"
    nao = "Não"

class ResolucaoProblemaEnum(str, Enum):
    sim_completamente = "Sim, completamente"
    parcialmente = "Parcialmente"
    nao_resolvido = "Não foi resolvido"

class TempoResolucaoEnum(str, Enum):
    imediatamente = "Imediatamente"
    ate_30_min = "Até 30 minutos"
    entre_30_min_e_2_horas = "Entre 30 min e 2 horas"
    mais_de_2_horas = "Mais de 2 horas"
    ainda_nao_resolvido = "Ainda não foi resolvido"

class AvaliacaoCreate(BaseModel)
    avaliacao_geral: AvaliacaoGeralEnum
    atendente_claro_educado: ClarezaEducacaoEnum
    problema_resolvido: ResolucaoProblemaEnum
    tempo_resolucao: TempoResolucaoEnum
    nps: int = Field(..., ge=0, le=10)

    class Config:
        orm_mode = True

class Avaliacao(AvaliacaoCreate):
    id: int
    id_atendimento: int
    respondido: bool
    data_envio: datetime.datetime