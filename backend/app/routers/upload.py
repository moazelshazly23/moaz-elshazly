import re
import time
import random
import hashlib
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from ..database import APK_DIR, IMAGES_DIR
from ..security import get_current_admin

router = APIRouter(tags=["Uploads"])

@router.post("/upload/apk")
async def upload_apk(apk: UploadFile = File(...), current_user: dict = Depends(get_current_admin)):
    if not apk or not apk.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No APK file uploaded",
        )

    clean_name = re.sub(r"[^a-zA-Z0-9.-]", "_", apk.filename)
    unique_suffix = f"{int(time.time() * 1000)}-{random.randint(1000, 9999)}"
    final_filename = f"{unique_suffix}-{clean_name}"
    target_path = APK_DIR / final_filename

    content = await apk.read()
    size_bytes = len(content)
    sha256 = hashlib.sha256(content).hexdigest()

    with open(target_path, "wb") as f:
        f.write(content)

    size_formatted = f"{(size_bytes / (1024 * 1024)):.1f} MB"
    apk_url = f"/uploads/apk/{final_filename}"

    return {
        "success": True,
        "apkUrl": apk_url,
        "apkFileName": final_filename,
        "originalName": apk.filename,
        "apkSize": size_formatted,
        "apkSizeBytes": size_bytes,
        "sha256": sha256,
    }

@router.post("/upload/image")
async def upload_image(image: UploadFile = File(...), current_user: dict = Depends(get_current_admin)):
    if not image or not image.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file uploaded",
        )

    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed",
        )

    ext = Path(image.filename).suffix.lower() or ".jpg"
    unique_suffix = f"{int(time.time() * 1000)}-{random.randint(1000, 9999)}"
    final_filename = f"img-{unique_suffix}{ext}"
    target_path = IMAGES_DIR / final_filename

    content = await image.read()
    with open(target_path, "wb") as f:
        f.write(content)

    image_url = f"/uploads/images/{final_filename}"
    return {
        "success": True,
        "imageUrl": image_url,
        "filename": final_filename,
    }
