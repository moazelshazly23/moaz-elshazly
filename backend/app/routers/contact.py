import time
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ..database import get_db, save_db
from ..security import get_current_admin

router = APIRouter(tags=["Contact"])

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str = "New Android Project Inquiry"
    message: str

class MessageStatusRequest(BaseModel):
    status: str

@router.post("/contact", status_code=status.HTTP_201_CREATED)
def submit_contact(req: ContactRequest):
    if not req.name or not req.email or not req.message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name, email, and message are required",
        )

    db = get_db()
    new_msg = {
        "id": f"msg_{int(time.time() * 1000)}",
        "name": req.name,
        "email": req.email,
        "subject": req.subject or "New Android Project Inquiry",
        "message": req.message,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "status": "unread",
    }

    db.setdefault("messages", []).insert(0, new_msg)
    save_db(db)

    return {
        "success": True,
        "message": "Thank you! Eng. Moaz will review your message promptly.",
    }

@router.get("/contact")
def get_messages(current_user: dict = Depends(get_current_admin)):
    db = get_db()
    return db.get("messages", [])

@router.put("/contact/{id}/status")
def update_message_status(id: str, req: MessageStatusRequest, current_user: dict = Depends(get_current_admin)):
    db = get_db()
    messages = db.get("messages", [])
    msg = next((m for m in messages if m.get("id") == id), None)

    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )

    msg["status"] = req.status
    save_db(db)
    return msg

@router.delete("/contact/{id}")
def delete_message(id: str, current_user: dict = Depends(get_current_admin)):
    db = get_db()
    db["messages"] = [m for m in db.get("messages", []) if m.get("id") != id]
    save_db(db)
    return {"success": True}
