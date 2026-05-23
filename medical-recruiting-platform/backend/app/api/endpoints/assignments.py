from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_current_active_user, require_admin, require_facility
from app.db.session import get_db
from app.models.assignment import Assignment, AssignmentStatus
from app.schemas.assignment import AssignmentCreate, AssignmentRead, AssignmentUpdate

router = APIRouter()

@router.get("/", response_model=List[AssignmentRead])
def list_assignments(skip: int = 0, limit: int = 100, status: AssignmentStatus = None, specialty_id: int = None, state: str = None, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    query = db.query(Assignment).filter(Assignment.is_active == True)
    if status:
        query = query.filter(Assignment.status == status)
    if specialty_id:
        query = query.filter(Assignment.specialty_id == specialty_id)
    if state:
        query = query.filter(Assignment.location_state == state)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=AssignmentRead, status_code=status.HTTP_201_CREATED)
def create_assignment(assign_in: AssignmentCreate, db: Session = Depends(get_db), current_user = Depends(require_facility)):
    assignment = Assignment(**assign_in.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.get("/{assign_id}", response_model=AssignmentRead)
def get_assignment(assign_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    assignment = db.query(Assignment).filter(Assignment.id == assign_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

@router.put("/{assign_id}", response_model=AssignmentRead)
def update_assignment(assign_id: int, assign_in: AssignmentUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    assignment = db.query(Assignment).filter(Assignment.id == assign_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if current_user.role not in ["admin", "recruiter"] and assignment.facility_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    update_data = assign_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assignment, field, value)
    db.commit()
    db.refresh(assignment)
    return assignment
