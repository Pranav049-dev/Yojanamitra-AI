import json
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine
from app.database.base import Base, User, Scheme, SchemeSource, SavedScheme, Investigation, ChatSession, ChatMessage, DocumentProgress
from app.core.security import get_password_hash
from app.services.rag_service import rag_service

DATA_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "verified_schemes.json")
)

def init_db(db: Session):
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)

    # 1. Seed demo user if not exists
    demo_email = "citizen@yojanamitra.gov"
    existing_user = db.query(User).filter(User.email == demo_email).first()
    if not existing_user:
        demo_user = User(
            name="Aarav Sharma",
            email=demo_email,
            password_hash=get_password_hash("Mitra@2026"),
            preferred_language="en",
            state="Madhya Pradesh",
            occupation="farmer",
            annual_income=180000.0
        )
        db.add(demo_user)
        db.commit()
        print(f"Created demo user: {demo_email} (Password: Mitra@2026)")

    # 2. Seed schemes from verified_schemes.json
    if not os.path.exists(DATA_FILE):
        print(f"Data file not found at: {DATA_FILE}")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        schemes_data = json.load(f)

    for s_data in schemes_data:
        existing = db.query(Scheme).filter(Scheme.slug == s_data["slug"]).first()
        if not existing:
            scheme = Scheme(
                slug=s_data["slug"],
                name=s_data["name"],
                description=s_data["description"],
                government_level=s_data["government_level"],
                state=s_data["state"],
                category=s_data["category"],
                beneficiary_category=s_data["beneficiary_category"],
                benefits=s_data["benefits"],
                eligibility_rules=s_data["eligibility_rules"],
                required_documents=s_data["required_documents"],
                application_steps=s_data["application_steps"],
                official_url=s_data["official_url"],
                verification_status=s_data.get("verification_status", "VERIFIED_OFFICIAL"),
                last_verified_at=datetime.now(timezone.utc)
            )
            db.add(scheme)
            db.commit()
            db.refresh(scheme)

            # Add sources
            for src in s_data.get("sources", []):
                s_source = SchemeSource(
                    scheme_id=scheme.id,
                    source_name=src["source_name"],
                    source_url=src["source_url"],
                    source_type=src["source_type"],
                    publication_date=src.get("publication_date"),
                    reliability_status=src.get("reliability_status", "HIGHLY_RELIABLE")
                )
                db.add(s_source)

            # Add investigation record
            inv = s_data.get("investigation", {})
            if inv:
                investigation = Investigation(
                    scheme_id=scheme.id,
                    summary=inv.get("summary", ""),
                    findings=inv.get("findings", []),
                    missing_information=inv.get("missing_information", ""),
                    source_references=[s["source_name"] for s in s_data.get("sources", [])],
                    fraud_alerts=inv.get("fraud_alerts", [])
                )
                db.add(investigation)

            db.commit()
            print(f"Seeded scheme: {scheme.name}")

    # Initialize RAG in-memory index
    all_schemes = db.query(Scheme).all()
    rag_service.ingest_schemes(all_schemes)
    print(f"RAG service indexed {len(all_schemes)} schemes ({len(rag_service.chunks)} text chunks).")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
