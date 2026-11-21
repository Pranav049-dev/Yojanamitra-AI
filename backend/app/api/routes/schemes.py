from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, List
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.scheme_service import SchemeService
from app.schemas.scheme import SchemeOut, SchemeListResponse, SchemeListItem, SchemeFilterOptions

router = APIRouter(tags=["Schemes"])

@router.get("/schemes", response_model=SchemeListResponse)
def list_schemes(
    q: Optional[str] = Query(None, description="Search term for name, description, benefits"),
    category: Optional[str] = Query(None, description="Filter by category"),
    state: Optional[str] = Query(None, description="Filter by state or All India"),
    government_level: Optional[str] = Query(None, description="Central or State"),
    beneficiary_category: Optional[str] = Query(None, description="Target beneficiary"),
    sort_by: str = Query("name_asc", description="Sort by: name_asc, name_desc, newest, verified"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db)
):
    result = SchemeService.get_schemes(
        db=db,
        query=q,
        category=category,
        state=state,
        government_level=government_level,
        beneficiary_category=beneficiary_category,
        sort_by=sort_by,
        page=page,
        limit=limit
    )
    return SchemeListResponse(
        total=result["total"],
        page=result["page"],
        limit=result["limit"],
        schemes=[SchemeListItem.model_validate(s) for s in result["schemes"]]
    )

@router.get("/schemes/search", response_model=List[SchemeListItem])
def quick_search(
    q: str = Query(..., min_length=1, description="Quick search term"),
    db: Session = Depends(get_db)
):
    result = SchemeService.get_schemes(db=db, query=q, page=1, limit=10)
    return [SchemeListItem.model_validate(s) for s in result["schemes"]]

@router.get("/schemes/{scheme_id}", response_model=SchemeOut)
def get_scheme(scheme_id: int, db: Session = Depends(get_db)):
    scheme = SchemeService.get_scheme_by_id(db, scheme_id)
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")
    return SchemeOut.model_validate(scheme)

@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    return SchemeService.get_categories(db)

@router.get("/states", response_model=List[str])
def get_states(db: Session = Depends(get_db)):
    return SchemeService.get_states(db)

@router.get("/filter-options", response_model=SchemeFilterOptions)
def get_filter_options(db: Session = Depends(get_db)):
    return SchemeFilterOptions(**SchemeService.get_filter_options(db))
