from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class SourceCitation(BaseModel):
    name: str
    url: str
    type: str
    reliability: str
    verified_date: Optional[str] = None

class InvestigationReportOut(BaseModel):
    scheme_id: int
    scheme_name: str
    slug: str
    overview: str
    intended_beneficiaries: str
    benefits_breakdown: str
    eligibility_conditions: List[Dict[str, Any]]
    required_documents: List[Dict[str, Any]]
    application_process: List[str]
    important_restrictions: List[str]
    official_sources: List[SourceCitation]
    verification_status: str
    verification_badge: str
    last_verified_at: Optional[str] = None
    missing_information: Optional[str] = None
    conflicting_information: Optional[str] = None
    fraud_warnings: List[str]
    audit_findings: List[str]
    analysis_disclaimer: str = "This investigation report compiles verifiable government records and does not constitute an official government order."
