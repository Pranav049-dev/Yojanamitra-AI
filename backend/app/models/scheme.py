from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False, index=True)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    government_level = Column(String(50), nullable=False, index=True)  # Central or State
    state = Column(String(100), nullable=False, index=True)  # All India or Specific State (e.g. Madhya Pradesh)
    category = Column(String(100), nullable=False, index=True)
    beneficiary_category = Column(String(100), nullable=False, index=True)
    benefits = Column(Text, nullable=False)
    eligibility_rules = Column(JSON, nullable=False)
    required_documents = Column(JSON, nullable=False)
    application_steps = Column(JSON, nullable=False)
    official_url = Column(String(500), nullable=False)
    verification_status = Column(String(50), default="VERIFIED_OFFICIAL", nullable=False)
    last_verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    sources = relationship("SchemeSource", back_populates="scheme", cascade="all, delete-orphan")
    saved_by = relationship("SavedScheme", back_populates="scheme", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="scheme", cascade="all, delete-orphan")
    document_progress = relationship("DocumentProgress", back_populates="scheme", cascade="all, delete-orphan")


class SchemeSource(Base):
    __tablename__ = "scheme_sources"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    source_name = Column(String(300), nullable=False)
    source_url = Column(String(1000), nullable=False)
    source_type = Column(String(100), nullable=False)
    accessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    publication_date = Column(String(100), nullable=True)
    reliability_status = Column(String(50), default="HIGHLY_RELIABLE")

    scheme = relationship("Scheme", back_populates="sources")
