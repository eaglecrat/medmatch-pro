from pydantic import BaseModel, EmailStr
from typing import Optional

class FacilityBase(BaseModel):
    name: str
    type: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    bed_count: Optional[int] = None
    trauma_level: Optional[str] = None

class FacilityCreate(FacilityBase):
    password: str

class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    bed_count: Optional[int] = None
    trauma_level: Optional[str] = None
    is_active: Optional[bool] = None

class FacilityRead(FacilityBase):
    id: int
    user_id: int
    is_verified: bool
    is_active: bool
    created_at: Optional[str] = None
    class Config:
        from_attributes = True
