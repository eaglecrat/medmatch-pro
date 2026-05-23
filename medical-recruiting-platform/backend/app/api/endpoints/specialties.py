from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_current_active_user, require_admin
from app.db.session import get_db
from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyRead

router = APIRouter()

@router.get("/", response_model=List[SpecialtyRead])
def list_specialties(skip: int = 0, limit: int = 200, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    return db.query(Specialty).offset(skip).limit(limit).all()

@router.post("/", response_model=SpecialtyRead, status_code=status.HTTP_201_CREATED)
def create_specialty(specialty_in: SpecialtyCreate, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    existing = db.query(Specialty).filter(Specialty.name == specialty_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Specialty already exists")
    specialty = Specialty(**specialty_in.model_dump())
    db.add(specialty)
    db.commit()
    db.refresh(specialty)
    return specialty

@router.get("/{specialty_id}", response_model=SpecialtyRead)
def get_specialty(specialty_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    specialty = db.query(Specialty).filter(Specialty.id == specialty_id).first()
    if not specialty:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return specialty
