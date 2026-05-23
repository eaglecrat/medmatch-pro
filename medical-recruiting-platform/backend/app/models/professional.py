from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Professional(Base):
    __tablename__ = "professionals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50))
    specialty_id = Column(Integer, ForeignKey("specialties.id"))
    years_experience = Column(Integer, default=0)
    preferred_locations = Column(Text)
    travel_radius_miles = Column(Integer, default=50)
    hourly_rate_min = Column(Numeric(10, 2))
    hourly_rate_max = Column(Numeric(10, 2))
    cv_url = Column(String(500))
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user = relationship("User", back_populates="professional")
    specialty = relationship("Specialty")
