from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Communication(Base):
    __tablename__ = "communications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    sender = Column(
        String(100),
        nullable=False
    )

    timestamp = Column(
        DateTime,
        nullable=True
    )

    message = Column(
        Text,
        nullable=False
    )

    source = Column(
        String(50),
        default="upload"
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )