from typing import Dict, Any
from fastapi import APIRouter, Depends
from ..database import get_db, save_db
from ..security import get_current_admin

router = APIRouter(tags=["Settings"])

@router.get("/settings")
def get_settings():
    db = get_db()
    return db.get("settings", {})

@router.put("/settings")
def update_settings(payload: Dict[str, Any], current_user: dict = Depends(get_current_admin)):
    db = get_db()
    settings = db.get("settings", {})
    settings.update(payload)
    db["settings"] = settings
    save_db(db)
    return {"success": True, "settings": settings}
