from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.verification import ClaimVerificationRequest, ClaimVerificationResponse
from app.services.verification_service import MisinformationVerificationService

router = APIRouter(prefix="/verification", tags=["Misinformation & Scam Checker"])

@router.post("/check", response_model=ClaimVerificationResponse)
def check_claim_authenticity(payload: ClaimVerificationRequest, db: Session = Depends(get_db)):
    if not payload.text or len(payload.text.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide the scheme message, forward, or claim text to verify (minimum 5 characters)."
        )

    res = MisinformationVerificationService.verify_claim(db, payload.text)
    return res
