from pydantic import BaseModel
from typing import Optional

class SpecialtyBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    compact_eligible: Optional[str] = "no"

class SpecialtyCreate(SpecialtyBase):
    pass

class SpecialtyRead(SpecialtyBase):
    id: int
    created_at: Optional[str] = None
    class Config:
        from_attributes = True
