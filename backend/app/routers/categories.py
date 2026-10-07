import time
import re
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from ..database import get_db, save_db
from ..security import get_current_admin

router = APIRouter(tags=["Categories"])

@router.get("/categories")
def get_categories():
    db = get_db()
    categories = db.get("categories", [])
    apps = db.get("apps", [])

    results = []
    for cat in categories:
        app_count = sum(
            1 for a in apps
            if a.get("category") == cat.get("slug") and a.get("status") == "published"
        )
        cat_copy = dict(cat)
        cat_copy["appCount"] = app_count
        results.append(cat_copy)

    return results

@router.post("/categories", status_code=status.HTTP_201_CREATED)
def create_category(payload: Dict[str, Any], current_user: dict = Depends(get_current_admin)):
    name = payload.get("name", {})
    slug = payload.get("slug")
    if not isinstance(name, dict) or not name.get("ar") or not slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name and slug are required",
        )

    clean_slug = re.sub(r"\s+", "-", slug.lower().strip())
    new_cat = {
        "id": f"cat_{int(time.time() * 1000)}",
        "name": name,
        "slug": clean_slug,
        "icon": payload.get("icon") or "Folder",
        "description": payload.get("description") or {"ar": "", "en": ""},
    }

    db = get_db()
    db.setdefault("categories", []).append(new_cat)
    save_db(db)
    return new_cat

@router.put("/categories/{id}")
def update_category(id: str, payload: Dict[str, Any], current_user: dict = Depends(get_current_admin)):
    db = get_db()
    categories = db.get("categories", [])
    idx = next((i for i, c in enumerate(categories) if c.get("id") == id), -1)

    if idx == -1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    categories[idx].update(payload)
    save_db(db)
    return categories[idx]

@router.delete("/categories/{id}")
def delete_category(id: str, current_user: dict = Depends(get_current_admin)):
    db = get_db()
    db["categories"] = [c for c in db.get("categories", []) if c.get("id") != id]
    save_db(db)
    return {"success": True}
