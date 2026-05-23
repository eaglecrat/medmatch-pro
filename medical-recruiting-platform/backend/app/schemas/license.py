from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LicenseBase(BaseModel):
    state: str
    license_number: str
    license_type: str = "RN"
    issue_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    is_compact: bool = False
    verification_url: Optional[str] = None

class LicenseCreate(LicenseBase):
    professional_id: int

class LicenseRead(LicenseBase):
    id: int
    professional_id: int
    is_verified: bool
    created_at: Optional[str] = None
    class Config:
        from_attributes = True
