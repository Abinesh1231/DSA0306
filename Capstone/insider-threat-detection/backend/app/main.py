from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.user import User
from app.routes.auth import router as auth_router
from app.routes.communications import router as communication_router
from app.routes.threat import router as threat_router
from app.routes.dashboard import router as dashboard_router
from app.routes.alerts import router as alerts_router
from app.routes.analytics import router as analytics_router

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Natural Language-Based Insider Threat Detection",
    description="AI-powered enterprise communication threat detection system",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(communication_router)
app.include_router(threat_router)
app.include_router(dashboard_router)
app.include_router(alerts_router)
app.include_router(analytics_router)

@app.get("/")
def root():
    return {
        "message": "Insider Threat Detection API is running",
        "status": "success"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FastAPI Backend"
    }