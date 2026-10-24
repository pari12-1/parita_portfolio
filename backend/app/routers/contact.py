from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
import re

router = APIRouter(prefix="/api/contact", tags=["Contact"])

class ContactRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    subject: str = Field(default="Portfolio Inquiry")
    message: str = Field(..., min_length=5)

@router.post("")
async def submit_contact(payload: ContactRequest):
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", payload.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    timestamp = datetime.utcnow().isoformat()
    return {
        "status": "success",
        "message": f"Thank you {payload.name}! Your message has been received by Pari's dispatch server.",
        "timestamp": timestamp
    }
