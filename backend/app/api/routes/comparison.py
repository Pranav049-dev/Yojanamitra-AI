from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.scheme_service import SchemeService
from app.schemas.comparison import SchemeCompareRequest, SchemeCompareResponse

router = APIRouter(prefix="/schemes", tags=["Scheme Comparison"])

@router.post("/compare", response_model=SchemeCompareResponse)
def compare_schemes(payload: SchemeCompareRequest, db: Session = Depends(get_db)):
    if not payload.scheme_ids or len(payload.scheme_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least 2 scheme IDs to compare."
        )
    if len(payload.scheme_ids) > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can compare a maximum of 4 schemes simultaneously."
        )

    res = SchemeService.compare_schemes(db, payload.scheme_ids)
    return SchemeCompareResponse(**res)
