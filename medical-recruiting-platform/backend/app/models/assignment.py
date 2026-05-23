from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class AssignmentStatus(str, enum.Enum):
    open = "open"
    filled = "filled"
    cancelled = "cancelled"
    completed = "completed"

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=False)
    specialty_id = Column(Integer, ForeignKey("specialties.id"), nullable=False)
    professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.open, nullable=False)
    shift_type = Column(String(50))
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    hourly_rate = Column(Numeric(10, 2))
    total_hours = Column(Numeric(8, 2))
    location_city = Column(String(100))
    location_state = Column(String(50))
    requirements = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    facility = relationship("Facility", back_populates="assignments")
    specialty = relationship("Specialty")
    professional = relationship("Professional", back_populates="assignments")
