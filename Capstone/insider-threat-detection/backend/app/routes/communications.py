import io
from datetime import datetime

import pandas as pd

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.communication import Communication
from app.models.threat_analysis import ThreatAnalysis

router = APIRouter(
    prefix="/api/communications",
    tags=["Communications"]
)


@router.post("/upload")
async def upload_communications(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are currently supported"
        )

    contents = await file.read()

    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV: {str(e)}"
        )

    required_columns = {
        "sender",
        "timestamp",
        "message"
    }

    missing = required_columns - set(df.columns)

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing columns: {', '.join(missing)}"
        )

    inserted = 0

    for _, row in df.iterrows():

        timestamp = None

        if pd.notna(row["timestamp"]):
            try:
                timestamp = pd.to_datetime(
                    row["timestamp"]
                ).to_pydatetime()
            except Exception:
                timestamp = None

        communication = Communication(
            sender=str(row["sender"]),
            timestamp=timestamp,
            message=str(row["message"]),
            source="csv_upload"
        )

        db.add(communication)
        inserted += 1

    db.commit()

    return {
        "message": "Communications uploaded successfully",
        "records_inserted": inserted
    }

@router.get("/")
def get_communications(
    db: Session = Depends(get_db)
):
    communications = db.query(
        Communication
    ).order_by(
        Communication.id.desc()
    ).all()

    results = []

    for communication in communications:

        analysis = db.query(
            ThreatAnalysis
        ).filter(
            ThreatAnalysis.communication_id
            == communication.id
        ).first()

        results.append({
            "id": communication.id,
            "sender": communication.sender,
            "timestamp": communication.timestamp,
            "message": communication.message,
            "source": communication.source,
            "threat_score": (
                analysis.threat_score
                if analysis else None
            ),
            "risk_level": (
                analysis.risk_level
                if analysis else "NOT ANALYZED"
            ),
            "threat_category": (
                analysis.threat_category
                if analysis else None
            )
        })

    return results