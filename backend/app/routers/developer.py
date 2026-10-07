from typing import Dict, Any
from fastapi import APIRouter, Depends
from ..database import get_db, save_db
from ..security import get_current_admin

router = APIRouter(tags=["Developer"])

@router.get("/developer")
def get_developer():
    db = get_db()
    developer = dict(db.get("developer", {}))
    apps = db.get("apps", [])

    total_apps = sum(1 for a in apps if a.get("status") == "published")
    total_downloads = sum(a.get("totalDownloads", 0) for a in apps)

    stats = dict(developer.get("stats", {}))
    stats["totalApps"] = total_apps
    stats["totalDownloads"] = total_downloads
    developer["stats"] = stats

    return developer

@router.put("/developer")
def update_developer(payload: Dict[str, Any], current_user: dict = Depends(get_current_admin)):
    db = get_db()
    developer = db.get("developer", {})
    developer.update(payload)
    db["developer"] = developer
    save_db(db)
    return {"success": True, "developer": developer}
