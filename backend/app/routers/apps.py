import os
import time
import math
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request, status
from fastapi.responses import FileResponse, RedirectResponse
from ..database import get_db, save_db, UPLOADS_DIR
from ..security import get_current_admin, verify_access_token

router = APIRouter(tags=["Apps"])

@router.get("/apps")
def get_apps(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    featured: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
):
    db = get_db()
    apps: List[Dict[str, Any]] = list(db.get("apps", []))

    # Determine if request has valid admin credentials
    is_admin = False
    if authorization and authorization.startswith("Bearer "):
        try:
            verify_access_token(authorization.split(" ")[1])
            is_admin = True
        except Exception:
            is_admin = False

    # Public readers can never expose drafts by passing a status query parameter.
    if is_admin:
        if status:
            apps = [a for a in apps if a.get("status") == status]
    else:
        apps = [a for a in apps if a.get("status") == "published"]

    # Category filtering
    if category and category != "all":
        apps = [a for a in apps if a.get("category") == category]

    # Featured filtering
    if featured == "true":
        apps = [a for a in apps if a.get("isFeatured")]

    # Search filtering
    if search:
        q = search.lower().strip()
        def match_app(a):
            title = a.get("title", {})
            tagline = a.get("tagline", {})
            tags = a.get("tags", [])
            return (
                q in title.get("ar", "").lower()
                or q in title.get("en", "").lower()
                or q in tagline.get("ar", "").lower()
                or q in tagline.get("en", "").lower()
                or q in a.get("packageName", "").lower()
                or any(q in str(t).lower() for t in tags)
            )
        apps = [a for a in apps if match_app(a)]

    # Sorting
    if sort == "downloads":
        apps.sort(key=lambda a: a.get("totalDownloads", 0), reverse=True)
    elif sort == "rating":
        apps.sort(key=lambda a: a.get("rating", 0), reverse=True)
    elif sort == "oldest":
        apps.sort(key=lambda a: a.get("createdAt", ""))
    else:
        # Default: newest updated
        apps.sort(key=lambda a: a.get("updatedAt", ""), reverse=True)

    return apps

@router.get("/apps/{slug_or_id}")
def get_app(slug_or_id: str):
    db = get_db()
    apps = db.get("apps", [])
    target = next((a for a in apps if (a.get("slug") == slug_or_id or a.get("id") == slug_or_id) and a.get("status") == "published"), None)

    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="App not found",
        )

    # Related apps: same category, published, up to 3
    related = [
        a for a in apps
        if a.get("id") != target.get("id")
        and a.get("category") == target.get("category")
        and a.get("status") == "published"
    ][:3]

    return {"app": target, "related": related}

@router.post("/apps", status_code=status.HTTP_201_CREATED)
def create_app(payload: Dict[str, Any], current_user: dict = Depends(get_current_admin)):
    title = payload.get("title", {})
    if not isinstance(title, dict) or not title.get("ar") or not title.get("en"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="App title (AR & EN) is required",
        )

    slug = payload.get("slug")
    if not slug:
        import re
        slug = re.sub(r"[^a-z0-9]+", "-", title.get("en", "").lower()).strip("-")

    now = datetime.now(timezone.utc).isoformat()
    app_id = f"app_{int(time.time() * 1000)}"

    initial_version = {
        "id": f"v_{int(time.time() * 1000)}",
        "versionName": payload.get("initialVersionName") or "v1.0.0",
        "versionCode": int(payload.get("initialVersionCode") or 1),
        "apkUrl": payload.get("initialApkUrl") or "",
        "apkFileName": payload.get("initialApkFileName") or "",
        "apkSize": payload.get("initialApkSize") or "10.0 MB",
        "apkSizeBytes": int(payload.get("initialApkSizeBytes") or 10485760),
        "minSdk": payload.get("minAndroid") or "Android 8.0 (API 26)",
        "targetSdk": "Android 14 (API 34)",
        "sha256": payload.get("initialSha256") or "",
        "releaseNotes": payload.get("initialReleaseNotes") or {
            "ar": "الإصدار الأولي للتطبيق",
            "en": "Initial stable application release",
        },
        "downloadsCount": 0,
        "releasedAt": now,
        "isLatest": True,
    }

    new_app = {
        "id": app_id,
        "slug": slug,
        "title": title,
        "tagline": payload.get("tagline") or {"ar": "", "en": ""},
        "description": payload.get("description") or {"ar": "", "en": ""},
        "features": payload.get("features") or {"ar": [], "en": []},
        "category": payload.get("category") or "utilities",
        "packageName": payload.get("packageName") or f"com.moaz.{slug.replace('-', '')}",
        "iconUrl": payload.get("iconUrl") or "",
        "bannerUrl": payload.get("bannerUrl") or "",
        "screenshots": payload.get("screenshots") or [],
        "githubUrl": payload.get("githubUrl") or "",
        "playStoreUrl": payload.get("playStoreUrl") or "",
        "status": payload.get("status") or "published",
        "isFeatured": bool(payload.get("isFeatured")),
        "rating": 5.0,
        "ratingCount": 1,
        "totalDownloads": 0,
        "currentVersion": initial_version["versionName"],
        "minAndroid": payload.get("minAndroid") or "Android 8.0 (API 26)",
        "versions": [initial_version],
        "tags": payload.get("tags") or [],
        "createdAt": now,
        "updatedAt": now,
    }

    db = get_db()
    db.setdefault("apps", []).insert(0, new_app)
    save_db(db)
    return new_app

@router.put("/apps/{id}")
def update_app(id: str, payload: Dict[str, Any], current_user: dict = Depends(get_current_admin)):
    db = get_db()
    apps = db.get("apps", [])
    idx = next((i for i, a in enumerate(apps) if a.get("id") == id), -1)

    if idx == -1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="App not found",
        )

    existing = apps[idx]
    now = datetime.now(timezone.utc).isoformat()
    existing.update(payload)
    existing["updatedAt"] = now
    apps[idx] = existing
    save_db(db)
    return existing

@router.delete("/apps/{id}")
def delete_app(id: str, current_user: dict = Depends(get_current_admin)):
    db = get_db()
    original_count = len(db.get("apps", []))
    db["apps"] = [a for a in db.get("apps", []) if a.get("id") != id]
    if len(db["apps"]) == original_count:
        raise HTTPException(status_code=404, detail="App not found")
    save_db(db)
    return {"success": True}

@router.post("/apps/{id}/versions", status_code=status.HTTP_201_CREATED)
def add_version(id: str, payload: Dict[str, Any], current_user: dict = Depends(get_current_admin)):
    db = get_db()
    apps = db.get("apps", [])
    app = next((a for a in apps if a.get("id") == id), None)

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="App not found",
        )

    version_name = payload.get("versionName")
    apk_url = payload.get("apkUrl")
    if not version_name or not apk_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Version name and APK file are required",
        )

    # Set all existing versions to not latest
    for v in app.get("versions", []):
        v["isLatest"] = False

    now = datetime.now(timezone.utc).isoformat()
    apk_file_name = payload.get("apkFileName") or Path(apk_url).name

    new_version = {
        "id": f"v_{int(time.time() * 1000)}",
        "versionName": version_name,
        "versionCode": int(payload.get("versionCode") or len(app.get("versions", [])) + 1),
        "apkUrl": apk_url,
        "apkFileName": apk_file_name,
        "apkSize": payload.get("apkSize") or "15 MB",
        "apkSizeBytes": int(payload.get("apkSizeBytes") or 15728640),
        "minSdk": payload.get("minSdk") or app.get("minAndroid", "Android 8.0 (API 26)"),
        "targetSdk": "Android 14 (API 34)",
        "sha256": payload.get("sha256") or "",
        "releaseNotes": payload.get("releaseNotes") or {
            "ar": "تحسينات وإصلاحات عامة",
            "en": "General improvements & bug fixes",
        },
        "downloadsCount": 0,
        "releasedAt": now,
        "isLatest": True,
    }

    app.setdefault("versions", []).insert(0, new_version)
    app["currentVersion"] = new_version["versionName"]
    app["updatedAt"] = now
    save_db(db)
    return new_version

@router.delete("/apps/{id}/versions/{version_id}")
def delete_version(id: str, version_id: str, current_user: dict = Depends(get_current_admin)):
    db = get_db()
    apps = db.get("apps", [])
    app = next((a for a in apps if a.get("id") == id), None)

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="App not found",
        )

    versions = app.get("versions", [])
    if len(versions) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the only remaining version of an app",
        )

    app["versions"] = [v for v in versions if v.get("id") != version_id]
    if app["versions"]:
        app["versions"][0]["isLatest"] = True
        app["currentVersion"] = app["versions"][0]["versionName"]

    app["updatedAt"] = datetime.now(timezone.utc).isoformat()
    save_db(db)
    return {"success": True}

# Download Tracking & Streaming (both with and without version_id)
@router.get("/apps/{id}/download")
@router.get("/apps/{id}/download/{version_id}")
def download_app(
    id: str,
    version_id: Optional[str] = None,
    json: Optional[str] = Query(None),
    request: Request = None,
):
    db = get_db()
    apps = db.get("apps", [])
    app = next((a for a in apps if (a.get("id") == id or a.get("slug") == id) and a.get("status") == "published"), None)

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="App not found",
        )

    versions = app.get("versions", [])
    version = None
    if version_id:
        version = next((v for v in versions if v.get("id") == version_id), None)
    if not version:
        version = next((v for v in versions if v.get("isLatest")), None) or (versions[0] if versions else None)

    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No version available for download",
        )

    # Increment counters
    app["totalDownloads"] = app.get("totalDownloads", 0) + 1
    version["downloadsCount"] = version.get("downloadsCount", 0) + 1

    # Log analytics
    client_ip = request.client.host if request and request.client else "anonymous"
    user_agent = request.headers.get("user-agent", "") if request else ""
    ip_hash = hashlib.md5(client_ip.encode()).hexdigest()[:10]

    db.setdefault("downloads", []).append({
        "id": f"dl_{int(time.time() * 1000)}_{ip_hash[:5]}",
        "appId": app.get("id"),
        "versionId": version.get("id"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ipHash": ip_hash,
        "userAgent": user_agent[:150],
    })
    save_db(db)

    # If client requested json
    if json == "true":
        return {
            "success": True,
            "appTitle": app.get("title"),
            "version": version.get("versionName"),
            "downloadUrl": version.get("apkUrl"),
            "fileName": version.get("apkFileName") or f"{app.get('slug')}-{version.get('versionName')}.apk",
            "size": version.get("apkSize", "15 MB"),
            "sha256": version.get("sha256", ""),
            "newTotalDownloads": app.get("totalDownloads"),
        }

    apk_url = version.get("apkUrl", "")
    # Check if local file exists
    local_rel = apk_url.lstrip("/")
    abs_path = (UPLOADS_DIR.parent / local_rel).resolve()
    if not abs_path.exists():
        abs_path = (UPLOADS_DIR / "apk" / Path(apk_url).name).resolve()

    if abs_path.exists() and abs_path.is_file():
        file_name = version.get("apkFileName") or f"{app.get('slug')}-{version.get('versionName')}.apk"
        return FileResponse(
            path=str(abs_path),
            media_type="application/vnd.android.package-archive",
            filename=file_name,
        )

    # If local file does not exist, redirect to apkUrl
    return RedirectResponse(url=apk_url)
