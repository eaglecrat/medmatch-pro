from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_current_active_user, require_admin
from app.db.session import get_db
from app.models.facility import Facility
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.schemas.facility import FacilityCreate, FacilityRead, FacilityUpdate

router = APIRouter()

@router.get("/", response_model=List[FacilityRead])
def list_facilities(skip: int = 0, limit: int = 100, state: str = None, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    query = db.query(Facility).filter(Facility.is_active == True)
    if state:
        query = query.filter(Facility.state == state)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=FacilityRead, status_code=status.HTTP_201_CREATED)
def create_facility(fac_in: FacilityCreate, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    existing = db.query(Facility).filter(Facility.email == fac_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Facility email already registered")
    user = User(email=fac_in.email, hashed_password=get_password_hash(fac_in.password), full_name=fac_in.name, role=UserRole.facility)
    db.add(user)
    db.commit()
    db.refresh(user)
    fac = Facility(user_id=user.id, name=fac_in.name, type=fac_in.type, address=fac_in.address, city=fac_in.city, state=fac_in.state, zip_code=fac_in.zip_code, phone=fac_in.phone, email=fac_in.email, website=fac_in.website, bed_count=fac_in.bed_count, trauma_level=fac_in.trauma_level)
    db.add(fac)
    db.commit()
    db.refresh(fac)
    return fac

@router.get("/{fac_id}", response_model=FacilityRead)
def get_facility(fac_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    fac = db.query(Facility).filter(Facility.id == fac_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    return fac

@router.put("/{fac_id}", response_model=FacilityRead)
def update_facility(fac_id: int, fac_in: FacilityUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    fac = db.query(Facility).filter(Facility.id == fac_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    if current_user.role not in ["admin"] and fac.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    update_data = fac_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fac, field, value)
    db.commit()
    db.refresh(fac)
    return fac
