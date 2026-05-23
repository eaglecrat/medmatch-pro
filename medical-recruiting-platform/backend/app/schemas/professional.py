from pydantic import BaseModel, EmailStr
from typing import Optional
from decimal import Decimal

class ProfessionalBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    years_experience: int = 0
    preferred_locations: Optional[str] = None
    travel_radius_miles: int = 50
    hourly_rate_min: Optional[Decimal] = None
    hourly_rate_max: Optional[Decimal] = None
    cv_url: Optional[str] = None

class ProfessionalCreate(ProfessionalBase):
    specialty_id: int
    password: str

class ProfessionalUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    specialty_id: Optional[int] = None
    years_experience: Optional[int] = None
    preferred_locations: Optional[str] = None
    travel_radius_miles: Optional[int] = None
    hourly_rate_min: Optional[Decimal] = None
    hourly_rate_max: Optional[Decimal] = None
    cv_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProfessionalRead(ProfessionalBase):
    id: int
    user_id: int
    specialty_id: int
    is_verified: bool
    is_active: bool
    created_at: Optional[str] = None
    class Config:
        from_attributes = True
