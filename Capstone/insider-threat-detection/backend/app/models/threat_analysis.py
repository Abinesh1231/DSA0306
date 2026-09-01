from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database import Base


class ThreatAnalysis(Base):
    __tablename__ = "threat_analysis"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    communication_id = Column(
        Integer,
        ForeignKey("communications.id"),
        nullable=False
    )

    threat_score = Column(
        Float,
        nullable=False
    )

    risk_level = Column(
        String(20),
        nullable=False
    )

    threat_category = Column(
        String(50),
        nullable=False
    )

    model_prediction = Column(
        String(100),
        nullable=True
    )

    analyzed_at = Column(
        DateTime,
        server_default=func.now()
    )