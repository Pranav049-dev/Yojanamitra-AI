from sqlalchemy import Column, Integer, ForeignKey, String, Boolean, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

class DocumentProgress(Base):
    __tablename__ = "document_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    document_name = Column(String(300), nullable=False)
    is_collected = Column(Boolean, default=False, nullable=False)
    notes = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "scheme_id", "document_name", name="uq_user_scheme_document"),
    )

    user = relationship("User", back_populates="document_progress")
    scheme = relationship("Scheme", back_populates="document_progress")
