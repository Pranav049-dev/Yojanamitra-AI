from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.investigation_service import InvestigationService
from app.schemas.investigation import InvestigationReportOut

router = APIRouter(prefix="/investigation", tags=["Investigation"])

@router.get("/{scheme_id}", response_model=InvestigationReportOut)
def get_investigation_report(scheme_id: int, db: Session = Depends(get_db)):
    report = InvestigationService.generate_or_get_report(db, scheme_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found for investigation")
    return report

@router.post("/{scheme_id}", response_model=InvestigationReportOut)
def trigger_investigation(scheme_id: int, db: Session = Depends(get_db)):
    report = InvestigationService.generate_or_get_report(db, scheme_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found for investigation")
    return report
