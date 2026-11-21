from pydantic import BaseModel
from typing import List, Optional

class ClaimVerificationRequest(BaseModel):
    text: str  # WhatsApp forward, message, claim text, or alleged notification

class ClaimItemVerdict(BaseModel):
    claim_extracted: str
    verdict: str  # "SUPPORTED", "UNSUPPORTED", "CONFLICTING", "UNVERIFIABLE", "FRAUD_ALERT"
    verdict_label: str
    confidence: float
    analysis: str
    matched_scheme: Optional[str] = None
    official_source_url: Optional[str] = None
    official_source_name: Optional[str] = None

class ClaimVerificationResponse(BaseModel):
    submitted_text: str
    overall_status: str  # "VERIFIED_GENUINE", "MISLEADING_OR_FALSE", "SUSPECTED_SCAM", "INCONCLUSIVE"
    overall_summary: str
    security_warnings: List[str]
    claim_breakdown: List[ClaimItemVerdict]
    official_guidance: str
