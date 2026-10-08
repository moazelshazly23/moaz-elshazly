import time
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from ..database import get_db, save_db
from ..security import get_current_admin

router = APIRouter(tags=["Suggestions"])
_recent_submissions: dict[str, float] = {}

class SuggestionRequest(BaseModel):
    type: str = Field(pattern="^(edit|app)$")
    name: Optional[str] = Field(default=None, max_length=100)
    email: Optional[str] = Field(default=None, max_length=254, pattern=r"^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
    app: Optional[str] = Field(default=None, max_length=160)
    suggestion: Optional[str] = Field(default=None, max_length=2000)
    details: Optional[str] = Field(default=None, max_length=5000)
    appName: Optional[str] = Field(default=None, max_length=160)
    appUrl: Optional[str] = Field(default=None, max_length=2048)
    category: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = Field(default=None, max_length=3000)
    officialWebsite: Optional[str] = Field(default=None, max_length=2048)
    website: Optional[str] = Field(default=None, max_length=2048)
    honeypot: Optional[str] = Field(default=None, max_length=200)

class SuggestionStatus(BaseModel):
    status: str = Field(pattern="^(pending|approved|rejected|reviewed)$")

@router.post("/suggestions", status_code=status.HTTP_201_CREATED)
def submit_suggestion(req: SuggestionRequest, request: Request):
    if req.honeypot:
        return {"success": True}
    if req.type == "edit" and (not req.app or not req.suggestion):
        raise HTTPException(status_code=400, detail="App and suggestion are required")
    if req.type == "app" and (not req.appName or not (req.appUrl or req.description)):
        raise HTTPException(status_code=400, detail="App name and app information are required")
    client = request.client.host if request.client else "unknown"
    now = time.time()
    if now - _recent_submissions.get(client, 0) < 30:
        raise HTTPException(status_code=429, detail="Please wait before sending another suggestion")
    _recent_submissions[client] = now
    item = req.model_dump(exclude={"honeypot"}, exclude_none=True)
    item.update({"id": f"sug_{int(now * 1000)}", "status": "pending", "createdAt": datetime.now(timezone.utc).isoformat()})
    db = get_db()
    db.setdefault("suggestions", []).insert(0, item)
    save_db(db)
    return {"success": True, "id": item["id"]}

@router.get("/suggestions")
def list_suggestions(current_admin: dict = Depends(get_current_admin)):
    return get_db().get("suggestions", [])

@router.put("/suggestions/{suggestion_id}")
def update_suggestion(suggestion_id: str, payload: SuggestionStatus, current_admin: dict = Depends(get_current_admin)):
    db = get_db()
    suggestion = next((item for item in db.get("suggestions", []) if item.get("id") == suggestion_id), None)
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    suggestion["status"] = payload.status
    suggestion["reviewedAt"] = datetime.now(timezone.utc).isoformat()
    save_db(db)
    return suggestion

@router.delete("/suggestions/{suggestion_id}")
def delete_suggestion(suggestion_id: str, current_admin: dict = Depends(get_current_admin)):
    db = get_db()
    original_count = len(db.get("suggestions", []))
    db["suggestions"] = [item for item in db.get("suggestions", []) if item.get("id") != suggestion_id]
    if len(db["suggestions"]) == original_count:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    save_db(db)
    return {"success": True}
