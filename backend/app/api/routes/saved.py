from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.scheme import Scheme
from app.models.saved_scheme import SavedScheme
from app.schemas.scheme import SchemeListItem
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/saved-schemes", tags=["Saved Schemes"])

class SavedSchemeCreate(BaseModel):
    scheme_id: int

@router.get("", response_model=List[SchemeListItem])
def get_user_saved_schemes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved = db.query(SavedScheme).filter(SavedScheme.user_id == current_user.id).all()
    scheme_ids = [s.scheme_id for s in saved]
    if not scheme_ids:
        return []
    schemes = db.query(Scheme).filter(Scheme.id.in_(scheme_ids)).all()
    return [SchemeListItem.model_validate(s) for s in schemes]

@router.post("", status_code=status.HTTP_201_CREATED)
def save_scheme(
    payload: SavedSchemeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scheme = db.query(Scheme).filter(Scheme.id == payload.scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    existing = db.query(SavedScheme).filter(
        SavedScheme.user_id == current_user.id,
        SavedScheme.scheme_id == payload.scheme_id
    ).first()
    if existing:
        return {"message": "Scheme is already saved in your bookmarks.", "id": existing.id}

    saved = SavedScheme(user_id=current_user.id, scheme_id=payload.scheme_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return {"message": "Scheme saved successfully.", "id": saved.id}

@router.delete("/{scheme_id}", status_code=status.HTTP_200_OK)
def remove_saved_scheme(
    scheme_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved = db.query(SavedScheme).filter(
        SavedScheme.user_id == current_user.id,
        SavedScheme.scheme_id == scheme_id
    ).first()
    if not saved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved scheme bookmark not found")

    db.delete(saved)
    db.commit()
    return {"message": "Scheme bookmark removed successfully."}
