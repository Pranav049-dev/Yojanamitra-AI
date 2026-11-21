from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.put("", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload.name is not None:
        current_user.name = payload.name.strip()
    if payload.preferred_language is not None:
        current_user.preferred_language = payload.preferred_language
    if payload.state is not None:
        current_user.state = payload.state
    if payload.occupation is not None:
        current_user.occupation = payload.occupation
    if payload.annual_income is not None:
        current_user.annual_income = payload.annual_income

    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)
