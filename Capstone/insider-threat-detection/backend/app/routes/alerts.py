from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.communication import Communication
from app.models.threat_analysis import ThreatAnalysis


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"]
)


@router.get("/")
def get_alerts(
    db: Session = Depends(get_db)
):

    results = (
        db.query(
            Communication,
            ThreatAnalysis
        )
        .join(
            ThreatAnalysis,
            Communication.id
            == ThreatAnalysis.communication_id
        )
        .filter(
            ThreatAnalysis.risk_level.in_([
                "MEDIUM",
                "HIGH",
                "CRITICAL"
            ])
        )
        .order_by(
            ThreatAnalysis.threat_score.desc()
        )
        .all()
    )

    alerts = []

    for communication, analysis in results:

        alerts.append({

            "id": analysis.id,

            "communication_id":
                communication.id,

            "sender":
                communication.sender,

            "message":
                communication.message,

            "timestamp": (
                communication.timestamp.isoformat()
                if communication.timestamp
                else None
            ),

            "threat_score":
                analysis.threat_score,

            "risk_level":
                analysis.risk_level,

            "threat_category":
                analysis.threat_category,

            "model_prediction":
                analysis.model_prediction,

            "source":
                communication.source

        })

    return alerts


@router.get("/summary")
def get_alert_summary(
    db: Session = Depends(get_db)
):

    medium = db.query(
        ThreatAnalysis
    ).filter(
        ThreatAnalysis.risk_level == "MEDIUM"
    ).count()

    high = db.query(
        ThreatAnalysis
    ).filter(
        ThreatAnalysis.risk_level == "HIGH"
    ).count()

    critical = db.query(
        ThreatAnalysis
    ).filter(
        ThreatAnalysis.risk_level == "CRITICAL"
    ).count()

    return {
        "total": medium + high + critical,
        "medium": medium,
        "high": high,
        "critical": critical
    }