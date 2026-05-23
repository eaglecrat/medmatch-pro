from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_current_active_user, require_admin
from app.db.session import get_db
from app.models.professional import Professional
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.schemas.professional import ProfessionalCreate, ProfessionalRead, ProfessionalUpdate

router = APIRouter()

@router.get("/", response_model=List[ProfessionalRead])
def list_professionals(skip: int = 0, limit: int = 100, specialty_id: int = None, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    query = db.query(Professional).filter(Professional.is_active == True)
    if specialty_id:
        query = query.filter(Professional.specialty_id == specialty_id)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=ProfessionalRead, status_code=status.HTTP_201_CREATED)
def create_professional(prof_in: ProfessionalCreate, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    existing = db.query(Professional).filter(Professional.email == prof_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=prof_in.email, hashed_password=get_password_hash(prof_in.password), full_name=prof_in.full_name, role=UserRole.professional)
    db.add(user)
    db.commit()
    db.refresh(user)
    prof = Professional(user_id=user.id, full_name=prof_in.full_name, email=prof_in.email, phone=prof_in.phone, specialty_id=prof_in.specialty_id, years_experience=prof_in.years_experience, preferred_locations=prof_in.preferred_locations, travel_radius_miles=prof_in.travel_radius_miles, hourly_rate_min=prof_in.hourly_rate_min, hourly_rate_max=prof_in.hourly_rate_max, cv_url=prof_in.cv_url)
    db.add(prof)
    db.commit()
    db.refresh(prof)
    return prof

@router.get("/{prof_id}", response_model=ProfessionalRead)
def get_professional(prof_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    prof = db.query(Professional).filter(Professional.id == prof_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Professional not found")
    return prof

@router.put("/{prof_id}", response_model=ProfessionalRead)
def update_professional(prof_id: int, prof_in: ProfessionalUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    prof = db.query(Professional).filter(Professional.id == prof_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Professional not found")
    if current_user.role not in ["admin", "recruiter"] and prof.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    update_data = prof_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prof, field, value)
    db.commit()
    db.refresh(prof)
    return prof
