from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import health, auth, users, specialties, professionals, facilities, assignments
from app.db.base import Base
from app.db.session import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedMatch API",
    description="Medical staffing platform backend — HIPAA-aware, RBAC-secured",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1/health", tags=["health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(specialties.router, prefix="/api/v1/specialties", tags=["specialties"])
app.include_router(professionals.router, prefix="/api/v1/professionals", tags=["professionals"])
app.include_router(facilities.router, prefix="/api/v1/facilities", tags=["facilities"])
app.include_router(assignments.router, prefix="/api/v1/assignments", tags=["assignments"])

@app.get("/")
def root():
    return {"message": "MedMatch API v1.0", "docs": "/api/docs"}
