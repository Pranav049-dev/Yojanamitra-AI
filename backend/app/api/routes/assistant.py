from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.assistant import ChatMessageCreate, ChatResponse, ChatSessionOut, ChatMessageOut
from app.services.ai_service import AIService
from app.api.dependencies import get_optional_current_user

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    session = None
    if payload.session_id:
        session = db.query(ChatSession).filter(ChatSession.id == payload.session_id).first()

    if not session:
        # Create a new session
        title = payload.content[:40] + ("..." if len(payload.content) > 40 else "")
        session = ChatSession(
            user_id=current_user.id if current_user else None,
            title=title
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=payload.content.strip(),
        citations=None
    )
    db.add(user_msg)
    db.commit()

    # Retrieve recent conversation history
    history_records = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()).all()
    history = [{"role": m.role, "content": m.content} for m in history_records[-6:]]

    # Generate grounded response
    ai_result = await AIService.generate_response(
        user_query=payload.content.strip(),
        language=payload.language or "en",
        conversation_history=history
    )

    # Save assistant response
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=ai_result["content"],
        citations=ai_result["citations"]
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatResponse(
        session_id=session.id,
        message=ChatMessageOut(
            id=assistant_msg.id,
            role=assistant_msg.role,
            content=assistant_msg.content,
            citations=ai_result["citations"],
            created_at=assistant_msg.created_at
        ),
        provider=ai_result["provider"],
        provider_note=ai_result["provider_note"]
    )

@router.get("/history", response_model=List[ChatSessionOut])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if not current_user:
        return []
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).limit(20).all()
    return [ChatSessionOut.model_validate(s) for s in sessions]
