import os
import json
import shutil
import threading
from pathlib import Path
from typing import Dict, Any

# Locate paths dynamically whether running from repo root or backend directory
CURRENT_FILE = Path(__file__).resolve()
APP_DIR = CURRENT_FILE.parent
BACKEND_DIR = APP_DIR.parent
REPO_ROOT = BACKEND_DIR.parent

# Check for server_data directory
DATA_DIR_ENV = os.environ.get("DATA_DIR")
if DATA_DIR_ENV:
    DATA_DIR = Path(DATA_DIR_ENV).resolve()
elif (BACKEND_DIR / "server_data").exists():
    DATA_DIR = BACKEND_DIR / "server_data"
elif (REPO_ROOT / "server_data").exists():
    DATA_DIR = REPO_ROOT / "server_data"
elif (Path.cwd() / "server_data").exists():
    DATA_DIR = Path.cwd() / "server_data"
else:
    DATA_DIR = REPO_ROOT / "server_data"

DB_FILE = DATA_DIR / "db.json"

# Check for uploads directory
UPLOADS_DIR_ENV = os.environ.get("UPLOADS_DIR")
if UPLOADS_DIR_ENV:
    UPLOADS_DIR = Path(UPLOADS_DIR_ENV).resolve()
elif (REPO_ROOT / "uploads").exists():
    UPLOADS_DIR = REPO_ROOT / "uploads"
elif (BACKEND_DIR / "uploads").exists():
    UPLOADS_DIR = BACKEND_DIR / "uploads"
elif (Path.cwd() / "uploads").exists():
    UPLOADS_DIR = Path.cwd() / "uploads"
else:
    UPLOADS_DIR = REPO_ROOT / "uploads"

APK_DIR = UPLOADS_DIR / "apk"
IMAGES_DIR = UPLOADS_DIR / "images"

# Global lock for thread-safe file writes
_db_lock = threading.Lock()

def get_fallback_initial_data() -> Dict[str, Any]:
    # Check if a seed db.json exists in any known location
    search_paths = [
        REPO_ROOT / "server_data" / "db.json",
        BACKEND_DIR / "server_data" / "db.json",
        Path.cwd() / "server_data" / "db.json",
    ]
    for path in search_paths:
        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass

    return {
        "admin": {
            "id": "admin_1",
            "name": "Eng. Moaz El Shazly",
            "email": "admin@engmoaz.com",
            "passwordHash": "$2b$10$Bk.3zMUTXBGjeuiOiUMapOs04b7EgYEjHj1xnWzvpOTRnCc5FPf6.",
        },
        "developer": {
            "name": {"ar": "المهندس معاذ الشاذلي", "en": "Eng. Moaz El Shazly"},
            "title": {"ar": "مطور تطبيقات أندرويد أول ومعماري برمجيات", "en": "Senior Android & Kotlin Multiplatform Architect"},
            "bio": {"ar": "مطور أندرويد بخبرة تزيد عن 8 سنوات...", "en": "Senior Android Engineer with 8+ years experience..."},
            "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            "email": "contact@engmoaz.com",
            "phone": "+20 100 123 4567",
            "location": {"ar": "القاهرة، مصر", "en": "Cairo, Egypt"},
            "experienceYears": 8,
            "skills": [],
            "social": {
                "github": "https://github.com",
                "linkedin": "https://linkedin.com",
                "googlePlay": "https://play.google.com/store/apps/dev",
                "website": "https://engmoaz.com"
            },
            "stats": {"totalApps": 5, "totalDownloads": 78800, "activeUsers": 45000, "averageRating": 4.9}
        },
        "categories": [],
        "apps": [],
        "downloads": [],
        "messages": [],
        "settings": {
            "siteLogoUrl": "/logo.svg",
            "siteTitleAr": "المهندس معاذ الشاذلي",
            "siteTitleEn": "Eng. Moaz El Shazly",
            "taglineAr": "المنصة الرسمية لتطبيقات أندرويد",
            "taglineEn": "Android Applications Showcase & APK Hub",
            "directDownloadEnabled": True,
        }
    }

def init_data_directories() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    APK_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    # If backend has separate server_data, ensure db.json is initialized
    if not DB_FILE.exists():
        initial = get_fallback_initial_data()
        save_db(initial)

    # Create dummy APK files if they don't exist
    sample_apks = [
        "zad-muslim-v3.2.0.apk",
        "zad-muslim-v3.1.0.apk",
        "novatask-v2.0.4.apk",
        "speedcast-v1.5.1.apk",
        "cryptopulse-v1.2.0.apk",
        "quickshare-v2.4.0.apk",
    ]
    for filename in sample_apks:
        file_path = APK_DIR / filename
        if not file_path.exists():
            header = b"PK\x03\x04\x14\x00\x00\x00\x08\x00Android Package for Eng. Moaz El Shazly - " + filename.encode()
            with open(file_path, "wb") as f:
                f.write(header)

def get_db() -> Dict[str, Any]:
    init_data_directories()
    with _db_lock:
        if not DB_FILE.exists():
            initial = get_fallback_initial_data()
            save_db(initial)
            return initial
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            if "settings" not in data:
                data["settings"] = {
                    "siteLogoUrl": "/logo.svg",
                    "siteTitleAr": "المهندس معاذ الشاذلي",
                    "siteTitleEn": "Eng. Moaz El Shazly",
                    "taglineAr": "المنصة الرسمية لتطبيقات أندرويد",
                    "taglineEn": "Android Applications Showcase & APK Hub",
                    "directDownloadEnabled": True,
                }
                save_db(data)
            return data
        except Exception as e:
            initial = get_fallback_initial_data()
            save_db(initial)
            return initial

def save_db(data: Dict[str, Any]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with _db_lock:
        tmp_file = DB_FILE.with_suffix(".json.tmp")
        with open(tmp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp_file, DB_FILE)
