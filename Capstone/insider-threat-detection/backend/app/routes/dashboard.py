from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.communication import Communication
from app.models.threat_analysis import ThreatAnalysis


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db)
):

    total_communications = db.query(
        Communication
    ).count()

    total_analyzed = db.query(
        ThreatAnalysis
    ).count()

    suspicious_messages = db.query(
        ThreatAnalysis
    ).filter(
        ThreatAnalysis.risk_level.in_([
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        ])
    ).count()

    high_risk = db.query(
        ThreatAnalysis
    ).filter(
        ThreatAnalysis.risk_level == "HIGH"
    ).count()

    critical_alerts = db.query(
        ThreatAnalysis
    ).filter(
        ThreatAnalysis.risk_level == "CRITICAL"
    ).count()

    low_risk = db.query(
        ThreatAnalysis
    ).filter(
        ThreatAnalysis.risk_level == "LOW"
    ).count()

    medium_risk = db.query(
        ThreatAnalysis
    ).filter(
        ThreatAnalysis.risk_level == "MEDIUM"
    ).count()

    return {
        "total_communications": total_communications,
        "total_analyzed": total_analyzed,
        "suspicious_messages": suspicious_messages,
        "low_risk": low_risk,
        "medium_risk": medium_risk,
        "high_risk": high_risk,
        "critical_alerts": critical_alerts
    }