from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DocumentItemOut(BaseModel):
    name: str
    is_mandatory: bool
    description: Optional[str] = None
    is_collected: bool = False
    notes: Optional[str] = None

class SchemeDocumentChecklistOut(BaseModel):
    scheme_id: int
    scheme_name: str
    total_documents: int
    collected_count: int
    percentage_complete: float
    documents: List[DocumentItemOut]

class DocumentProgressUpdate(BaseModel):
    document_name: str
    is_collected: bool
    notes: Optional[str] = None
