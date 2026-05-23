from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class License(Base):
    __tablename__ = "licenses"
    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=False)
    state = Column(String(50), nullable=False)
    license_number = Column(String(100), nullable=False)
    license_type = Column(String(100), default="RN")
    issue_date = Column(DateTime(timezone=True))
    expiration_date = Column(DateTime(timezone=True))
    is_compact = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    professional = relationship("Professional", back_populates="licenses")
