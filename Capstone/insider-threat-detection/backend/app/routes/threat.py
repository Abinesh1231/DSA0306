from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.communication import Communication
from app.models.threat_analysis import ThreatAnalysis
from app.ml.predictor import predict_threat


router = APIRouter(
    prefix="/api/threat",
    tags=["Threat Detection"]
)


@router.get("/{communication_id}")
def get_threat_details(
    communication_id: int,
    db: Session = Depends(get_db)
):
    communication = db.query(Communication).filter(
        Communication.id == communication_id
    ).first()

    if not communication:
        raise HTTPException(
            status_code=404,
            detail="Communication not found"
        )

    analysis = db.query(ThreatAnalysis).filter(
        ThreatAnalysis.communication_id == communication_id
    ).first()

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Threat analysis not available"
        )

    # Re-run the current pretrained model so the detail endpoint cannot
    # display stale database classification/risk values after a model update.
    result = predict_threat(communication.message)

    return {
        "communication_id": communication.id,
        "sender": communication.sender,
        "timestamp": (
            communication.timestamp.isoformat()
            if communication.timestamp
            else None
        ),
        "message": communication.message,
        "source": communication.source,
        "threat_score": result["threat_score"],
        "risk_level": result["risk_level"],
        "threat_category": result["threat_category"],
        "model_prediction": result["model_prediction"],
        "confidence": result["confidence"],
        "indicators": result["indicators"],
        "model_name": result["model_name"],
        "model_type": result["model_type"],
    }


@router.post("/analyze/{communication_id}")
def analyze_communication(
    communication_id: int,
    db: Session = Depends(get_db)
):
    communication = db.query(Communication).filter(
        Communication.id == communication_id
    ).first()

    if not communication:
        raise HTTPException(
            status_code=404,
            detail="Communication not found"
        )

    result = predict_threat(communication.message)

    analysis = db.query(ThreatAnalysis).filter(
        ThreatAnalysis.communication_id == communication_id
    ).first()

    if analysis:
        analysis.threat_score = result["threat_score"]
        analysis.risk_level = result["risk_level"]
        analysis.threat_category = result["threat_category"]
        analysis.model_prediction = result["model_prediction"]
    else:
        analysis = ThreatAnalysis(
            communication_id=communication_id,
            threat_score=result["threat_score"],
            risk_level=result["risk_level"],
            threat_category=result["threat_category"],
            model_prediction=result["model_prediction"],
        )
        db.add(analysis)

    db.commit()
    db.refresh(analysis)

    return {
        "communication_id": communication_id,
        "sender": communication.sender,
        "message": communication.message,
        "threat_score": result["threat_score"],
        "risk_level": result["risk_level"],
        "threat_category": result["threat_category"],
        "confidence": result["confidence"],
        "indicators": result["indicators"],
        "model_name": result["model_name"],
        "model_type": result["model_type"],
    }


@router.post("/analyze-all")
def analyze_all_communications(
    db: Session = Depends(get_db)
):
    communications = db.query(Communication).all()

    if not communications:
        return {
            "message": "No communications available",
            "analyzed": 0
        }

    analyzed = 0

    for communication in communications:
        result = predict_threat(communication.message)

        analysis = db.query(ThreatAnalysis).filter(
            ThreatAnalysis.communication_id == communication.id
        ).first()

        if analysis:
            analysis.threat_score = result["threat_score"]
            analysis.risk_level = result["risk_level"]
            analysis.threat_category = result["threat_category"]
            analysis.model_prediction = result["model_prediction"]
        else:
            analysis = ThreatAnalysis(
                communication_id=communication.id,
                threat_score=result["threat_score"],
                risk_level=result["risk_level"],
                threat_category=result["threat_category"],
                model_prediction=result["model_prediction"],
            )
            db.add(analysis)

        analyzed += 1

    db.commit()

    return {
        "message": "Threat analysis completed",
        "analyzed": analyzed,
        "model": "typeform/distilbert-base-uncased-mnli",
        "model_type": "pretrained_zero_shot_nli",
    }
