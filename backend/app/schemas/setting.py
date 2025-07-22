# app/schemas/setting.py
from pydantic import BaseModel

class SettingUpdate(BaseModel):
    enabled: bool

class SettingResponse(BaseModel):
    key: str
    enabled: bool