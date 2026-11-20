from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.user import User
from app.models.scheme import Scheme
from app.models.document import DocumentProgress
from app.schemas.document import SchemeDocumentChecklistOut, DocumentItemOut, DocumentProgressUpdate
from app.api.dependencies import get_current_user, get_optional_current_user

router = APIRouter(prefix="/schemes", tags=["Documents"])

@router.get("/{scheme_id}/documents", response_model=SchemeDocumentChecklistOut)
def get_scheme_documents(
    scheme_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    docs = scheme.required_documents if isinstance(scheme.required_documents, list) else []

    # If logged in, fetch user's progress records
    progress_map = {}
    if current_user:
        records = db.query(DocumentProgress).filter(
            DocumentProgress.user_id == current_user.id,
            DocumentProgress.scheme_id == scheme_id
        ).all()
        for r in records:
            progress_map[r.document_name] = {"is_collected": r.is_collected, "notes": r.notes}

    items = []
    collected_count = 0
    for d in docs:
        d_name = d.get("name", "")
        is_mand = d.get("is_mandatory", True)
        d_desc = d.get("description", "")

        user_info = progress_map.get(d_name, {"is_collected": False, "notes": None})
        if user_info["is_collected"]:
            collected_count += 1

        items.append(DocumentItemOut(
            name=d_name,
            is_mandatory=is_mand,
            description=d_desc,
            is_collected=user_info["is_collected"],
            notes=user_info["notes"]
        ))

    total = len(items)
    percentage = (collected_count / total * 100.0) if total > 0 else 0.0

    return SchemeDocumentChecklistOut(
        scheme_id=scheme.id,
        scheme_name=scheme.name,
        total_documents=total,
        collected_count=collected_count,
        percentage_complete=round(percentage, 1),
        documents=items
    )

@router.put("/{scheme_id}/documents/progress", response_model=DocumentItemOut)
def update_document_progress(
    scheme_id: int,
    payload: DocumentProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    record = db.query(DocumentProgress).filter(
        DocumentProgress.user_id == current_user.id,
        DocumentProgress.scheme_id == scheme_id,
        DocumentProgress.document_name == payload.document_name
    ).first()

    if not record:
        record = DocumentProgress(
            user_id=current_user.id,
            scheme_id=scheme_id,
            document_name=payload.document_name,
            is_collected=payload.is_collected,
            notes=payload.notes
        )
        db.add(record)
    else:
        record.is_collected = payload.is_collected
        if payload.notes is not None:
            record.notes = payload.notes

    db.commit()
    db.refresh(record)

    # Find mandatory attribute from scheme definition
    is_mand = True
    desc = None
    if isinstance(scheme.required_documents, list):
        for d in scheme.required_documents:
            if d.get("name") == payload.document_name:
                is_mand = d.get("is_mandatory", True)
                desc = d.get("description")
                break

    return DocumentItemOut(
        name=record.document_name,
        is_mandatory=is_mand,
        description=desc,
        is_collected=record.is_collected,
        notes=record.notes
    )
