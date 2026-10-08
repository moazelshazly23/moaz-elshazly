"""Durable JSON document storage for the API.

Set DATA_DIR to a persistent volume in production. This module intentionally
never imports the checked-in demo database or silently replaces corrupt data.
"""
import json
import os
import threading
from pathlib import Path
from typing import Any, Dict

CURRENT_FILE = Path(__file__).resolve()
APP_DIR = CURRENT_FILE.parent
BACKEND_DIR = APP_DIR.parent
REPO_ROOT = BACKEND_DIR.parent
DATA_DIR = Path(os.environ.get("DATA_DIR", str(BACKEND_DIR / "runtime_data"))).expanduser().resolve()
DB_FILE = DATA_DIR / "db.json"
UPLOADS_DIR = Path(os.environ.get("UPLOADS_DIR", str(DATA_DIR / "uploads"))).expanduser().resolve()
APK_DIR = UPLOADS_DIR / "apk"
IMAGES_DIR = UPLOADS_DIR / "images"
_db_lock = threading.RLock()


def empty_database() -> Dict[str, Any]:
    """Return an empty production database. No demo content is seeded."""
    admin: Dict[str, Any] = {}
    admin_email = os.environ.get("ADMIN_EMAIL", "").strip()
    password_hash = os.environ.get("ADMIN_PASSWORD_HASH", "").strip()
    if admin_email and password_hash:
        admin = {
            "id": "admin_1",
            "name": os.environ.get("ADMIN_NAME", "Administrator").strip() or "Administrator",
            "email": admin_email,
            "passwordHash": password_hash,
        }
    return {
        "admin": admin,
        "developer": {"name": {"ar": "", "en": ""}, "title": {"ar": "", "en": ""}, "bio": {"ar": "", "en": ""}, "avatarUrl": "", "email": "", "phone": "", "location": {"ar": "", "en": ""}, "experienceYears": 0, "skills": [], "social": {}, "stats": {"totalApps": 0, "totalDownloads": 0, "happyUsers": "0", "yearsOfExperience": 0}},
        "categories": [],
        "apps": [],
        "downloads": [],
        "messages": [],
        "suggestions": [],
        "settings": {"siteLogoUrl": "", "siteTitleAr": "", "siteTitleEn": "", "taglineAr": "", "taglineEn": "", "directDownloadEnabled": True},
    }


def init_data_directories() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    APK_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    with _db_lock:
        if not DB_FILE.exists():
            save_db(empty_database())


def get_db() -> Dict[str, Any]:
    init_data_directories()
    with _db_lock:
        try:
            with DB_FILE.open("r", encoding="utf-8") as f:
                data = json.load(f)
        except (OSError, json.JSONDecodeError) as exc:
            # Do not turn storage loss/corruption into a successful-looking reset.
            raise RuntimeError(f"Could not read persistent database at {DB_FILE}: {exc}") from exc
        if not isinstance(data, dict):
            raise RuntimeError(f"Persistent database at {DB_FILE} must contain a JSON object")
        return data


def save_db(data: Dict[str, Any]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with _db_lock:
        tmp_file = DB_FILE.with_suffix(".json.tmp")
        with tmp_file.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_file, DB_FILE)
