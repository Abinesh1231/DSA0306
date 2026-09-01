from collections import Counter
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.communication import Communication
from app.models.threat_analysis import ThreatAnalysis


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/")
def get_analytics(
    db: Session = Depends(get_db)
):

    communications = db.query(
        Communication
    ).all()

    analyses = db.query(
        ThreatAnalysis
    ).all()

    total_communications = len(
        communications
    )

    total_analyzed = len(analyses)

    # -----------------------------------------
    # RISK DISTRIBUTION
    # -----------------------------------------

    risk_counter = Counter(
        analysis.risk_level
        for analysis in analyses
        if analysis.risk_level
    )

    risk_distribution = {
        "LOW": risk_counter.get("LOW", 0),
        "MEDIUM": risk_counter.get("MEDIUM", 0),
        "HIGH": risk_counter.get("HIGH", 0),
        "CRITICAL": risk_counter.get("CRITICAL", 0)
    }

    # -----------------------------------------
    # THREAT CATEGORIES
    # -----------------------------------------

    category_counter = Counter(
        analysis.threat_category
        for analysis in analyses
        if analysis.threat_category
    )

    threat_categories = [
        {
            "category": category,
            "count": count
        }
        for category, count
        in category_counter.most_common()
    ]

    # -----------------------------------------
    # THREAT SCORES
    # -----------------------------------------

    scores = [
        float(analysis.threat_score)
        for analysis in analyses
        if analysis.threat_score is not None
    ]

    average_threat_score = (
        round(sum(scores) / len(scores), 2)
        if scores
        else 0
    )

    highest_threat_score = (
        round(max(scores), 2)
        if scores
        else 0
    )

    # -----------------------------------------
    # HIGH RISK PERCENTAGE
    # -----------------------------------------

    high_risk_count = (
        risk_distribution["HIGH"]
        + risk_distribution["CRITICAL"]
    )

    high_risk_percentage = (
        round(
            (
                high_risk_count
                / total_analyzed
            ) * 100,
            2
        )
        if total_analyzed
        else 0
    )

    # -----------------------------------------
    # CONFIDENCE
    # -----------------------------------------

    confidences = []

    for analysis in analyses:

        if hasattr(
            analysis,
            "confidence"
        ):

            if analysis.confidence is not None:

                confidences.append(
                    float(analysis.confidence)
                )

    average_confidence = (
        round(
            sum(confidences)
            / len(confidences),
            2
        )
        if confidences
        else 0
    )

    # -----------------------------------------
    # TIME TREND
    # -----------------------------------------

    communication_map = {
        communication.id:
            communication
        for communication
        in communications
    }

    daily_counter = Counter()

    for analysis in analyses:

        communication = (
            communication_map.get(
                analysis.communication_id
            )
        )

        if not communication:
            continue

        if not communication.timestamp:
            continue

        date_key = (
            communication.timestamp
            .date()
            .isoformat()
        )

        daily_counter[date_key] += 1

    time_trend = [
        {
            "date": date,
            "count": count
        }
        for date, count
        in sorted(
            daily_counter.items()
        )
    ]

    return {

        "total_communications":
            total_communications,

        "total_analyzed":
            total_analyzed,

        "risk_distribution":
            risk_distribution,

        "threat_categories":
            threat_categories,

        "average_threat_score":
            average_threat_score,

        "highest_threat_score":
            highest_threat_score,

        "high_risk_percentage":
            high_risk_percentage,

        "average_confidence":
            average_confidence,

        "time_trend":
            time_trend

    }