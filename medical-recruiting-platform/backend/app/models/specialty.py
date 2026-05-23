from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class Specialty(Base):
    __tablename__ = "specialties"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False)
    description = Column(Text)
    compact_eligible = Column(String(10), default="no")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
