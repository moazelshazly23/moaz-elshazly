import os
import sys
from pathlib import Path
from datetime import datetime, timezone
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure backend directory is in sys.path
CURRENT_FILE = Path(__file__).resolve()
APP_DIR = CURRENT_FILE.parent
BACKEND_DIR = APP_DIR.parent
REPO_ROOT = BACKEND_DIR.parent

for p in [str(BACKEND_DIR), str(REPO_ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from .database import get_db, init_data_directories, UPLOADS_DIR
from .routers import auth, apps, categories, developer, analytics, contact, settings, upload, suggestions

# Initialize the empty runtime database; demo fixtures are never loaded here.
init_data_directories()
get_db()  # Fail fast if persistent storage is corrupt or unreadable.

app = FastAPI(
    title="Eng. Moaz El Shazly Android Apps Platform",
    description="Official API for Android Applications Showcase & APK Hub",
    version="1.0.0",
)

# Exception handler ensuring { error: "...", detail: "..." } structure for frontend compatibility
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail_str = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": detail_str, "detail": exc.detail},
        headers=getattr(exc, "headers", None),
    )

# CORS Configuration
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "https://moazelshazly23.github.io,http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Serve uploaded static files (APKs and Images)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Health Check Endpoints
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}

@app.get("/api/health", tags=["Health"])
def api_health_check():
    return {
        "status": "ok",
        "app": "Eng. Moaz El Shazly Android Apps Platform",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

# Register Routers under /api
api_routers = [
    auth.router,
    apps.router,
    categories.router,
    developer.router,
    analytics.router,
    contact.router,
    settings.router,
    upload.router,
    suggestions.router,
]

for r in api_routers:
    app.include_router(r, prefix="/api")
    # Also include without /api prefix for maximum platform & routing compatibility
    app.include_router(r)

# If built frontend exists in dist, serve it
dist_dirs = [
    REPO_ROOT / "dist",
    BACKEND_DIR / "dist",
]
dist_dir = next((d for d in dist_dirs if d.exists() and (d / "index.html").exists()), None)

if dist_dir:
    assets_dir = dist_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        target = dist_dir / full_path
        if target.is_file():
            return FileResponse(str(target))
        return FileResponse(str(dist_dir / "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
