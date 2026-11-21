from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatCitation(BaseModel):
    scheme_id: int
    scheme_name: str
    official_url: str
    source_name: str
    relevance_snippet: str

class ChatMessageCreate(BaseModel):
    content: str
    session_id: Optional[int] = None
    language: Optional[str] = "en"  # "en" or "hi"

class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    citations: Optional[List[ChatCitation]] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: List[ChatMessageOut] = []

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    session_id: int
    message: ChatMessageOut
    provider: str  # "gemini", "openai", or "local_rag_search"
    provider_note: Optional[str] = None
