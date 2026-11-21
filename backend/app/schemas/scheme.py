from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class SchemeSourceOut(BaseModel):
    id: int
    source_name: str
    source_url: str
    source_type: str
    publication_date: Optional[str] = None
    reliability_status: str

    class Config:
        from_attributes = True

class SchemeBase(BaseModel):
    name: str
    slug: str
    description: str
    government_level: str
    state: str
    category: str
    beneficiary_category: str
    benefits: str
    eligibility_rules: Dict[str, Any]
    required_documents: List[Dict[str, Any]]
    application_steps: List[str]
    official_url: str
    verification_status: str
    last_verified_at: Optional[datetime] = None

class SchemeOut(SchemeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    sources: Optional[List[SchemeSourceOut]] = []

    class Config:
        from_attributes = True

class SchemeListItem(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    government_level: str
    state: str
    category: str
    beneficiary_category: str
    benefits: str
    official_url: str
    verification_status: str

    class Config:
        from_attributes = True

class SchemeListResponse(BaseModel):
    total: int
    page: int
    limit: int
    schemes: List[SchemeListItem]

class SchemeFilterOptions(BaseModel):
    categories: List[str]
    states: List[str]
    government_levels: List[str]
    beneficiary_categories: List[str]
