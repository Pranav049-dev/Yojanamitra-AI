from sqlalchemy import Column, Integer, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    findings = Column(JSON, nullable=False)
    missing_information = Column(Text, nullable=True)
    source_references = Column(JSON, nullable=False)
    fraud_alerts = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    scheme = relationship("Scheme", back_populates="investigations")
