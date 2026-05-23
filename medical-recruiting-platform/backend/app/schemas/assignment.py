from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.models.assignment import AssignmentStatus

class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    shift_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    hourly_rate: Optional[Decimal] = None
    total_hours: Optional[Decimal] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    requirements: Optional[str] = None

class AssignmentCreate(AssignmentBase):
    facility_id: int
    specialty_id: int

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[AssignmentStatus] = None
    shift_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    hourly_rate: Optional[Decimal] = None
    total_hours: Optional[Decimal] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    requirements: Optional[str] = None
    professional_id: Optional[int] = None
    is_active: Optional[bool] = None

class AssignmentRead(AssignmentBase):
    id: int
    facility_id: int
    specialty_id: int
    professional_id: Optional[int] = None
    status: AssignmentStatus
    is_active: bool
    created_at: Optional[str] = None
    class Config:
        from_attributes = True
