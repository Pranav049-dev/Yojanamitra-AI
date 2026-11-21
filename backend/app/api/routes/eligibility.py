from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.scheme import Scheme
from app.schemas.eligibility import EligibilityCheckRequest, EligibilityCheckResponse
from app.services.eligibility_service import EligibilityEngine

router = APIRouter(prefix="/eligibility", tags=["Eligibility"])

@router.post("/check", response_model=EligibilityCheckResponse)
def evaluate_eligibility(payload: EligibilityCheckRequest, db: Session = Depends(get_db)):
    if payload.scheme_id:
        scheme = db.query(Scheme).filter(Scheme.id == payload.scheme_id).first()
        if not scheme:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified scheme not found")
        schemes = [scheme]
    else:
        schemes = db.query(Scheme).all()

    response = EligibilityEngine.check_eligibility(schemes, payload.profile)
    return response
