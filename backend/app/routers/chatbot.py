from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from ..services.ai_assistant import answer_chat_message

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []
    action: Optional[str] = None

@router.post("", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    try:
        raw_history = [{"role": m.role, "content": m.content} for m in (payload.history or [])]
        result = await answer_chat_message(payload.message, raw_history)
        return ChatResponse(
            reply=result.get("reply", ""),
            suggestions=result.get("suggestions", []),
            action=result.get("action")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggestions")
async def get_suggestions():
    return {
        "suggestions": [
            "Tell me about your AI & ML stack",
            "What is Antigravity and how do you use it?",
            "Explain your Whisper real-time audio pipeline",
            "Show your cloud setup (Render, Vercel, Railway)",
            "How can I hire you?"
        ]
    }
