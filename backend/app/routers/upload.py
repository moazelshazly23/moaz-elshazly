import hashlib
import random
import re
import time
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from ..database import APK_DIR, IMAGES_DIR
from ..security import get_current_admin

router = APIRouter(tags=["Uploads"])
APK_MAX_BYTES = 200 * 1024 * 1024
IMAGE_MAX_BYTES = 10 * 1024 * 1024
IMAGE_SIGNATURES = {
    ".jpg": (b"\xff\xd8\xff",), ".jpeg": (b"\xff\xd8\xff",),
    ".png": (b"\x89PNG\r\n\x1a\n",), ".gif": (b"GIF87a", b"GIF89a"),
    ".webp": (b"RIFF",),
}

async def read_limited(upload: UploadFile, limit: int) -> bytes:
    content = await upload.read(limit + 1)
    if len(content) > limit:
        raise HTTPException(status_code=413, detail="Uploaded file is too large")
    return content

@router.post("/upload/apk")
async def upload_apk(apk: UploadFile = File(...), current_user: dict = Depends(get_current_admin)):
    if not apk.filename or Path(apk.filename).suffix.lower() != ".apk":
        raise HTTPException(status_code=400, detail="Only .apk files are allowed")
    content = await read_limited(apk, APK_MAX_BYTES)
    if len(content) < 4 or content[:4] != b"PK\x03\x04":
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid APK archive")
    clean_name = re.sub(r"[^a-zA-Z0-9.-]", "_", Path(apk.filename).name)
    final_filename = f"{int(time.time() * 1000)}-{random.randint(1000, 9999)}-{clean_name}"
    target_path = APK_DIR / final_filename
    target_path.write_bytes(content)
    return {"success": True, "apkUrl": f"/uploads/apk/{final_filename}", "apkFileName": final_filename, "originalName": apk.filename, "apkSize": f"{len(content) / (1024 * 1024):.1f} MB", "apkSizeBytes": len(content), "sha256": hashlib.sha256(content).hexdigest()}

@router.post("/upload/image")
async def upload_image(image: UploadFile = File(...), current_user: dict = Depends(get_current_admin)):
    if not image.filename:
        raise HTTPException(status_code=400, detail="No image file uploaded")
    ext = Path(image.filename).suffix.lower()
    if ext not in IMAGE_SIGNATURES:
        raise HTTPException(status_code=400, detail="Use a JPG, PNG, GIF, or WebP image")
    content = await read_limited(image, IMAGE_MAX_BYTES)
    if not any(content.startswith(signature) for signature in IMAGE_SIGNATURES[ext]):
        raise HTTPException(status_code=400, detail="Image content does not match its file type")
    if ext == ".webp" and content[8:12] != b"WEBP":
        raise HTTPException(status_code=400, detail="Invalid WebP image")
    filename = f"img-{int(time.time() * 1000)}-{random.randint(1000, 9999)}{ext}"
    (IMAGES_DIR / filename).write_bytes(content)
    return {"success": True, "imageUrl": f"/uploads/images/{filename}", "filename": filename}
