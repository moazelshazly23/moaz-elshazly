from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from ..database import get_db, save_db
from ..security import verify_password, hash_password, create_access_token, get_current_admin

router = APIRouter(tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = None

@router.post("/auth/login")
def login(req: LoginRequest):
    if not req.email or not req.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username/Email and password are required",
        )

    db = get_db()
    admin = db.get("admin", {})
    if not admin.get('email') or not admin.get('passwordHash'):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Admin credentials are not configured')
    input_str = req.email.strip().lower()
    email_matches = admin.get("email", "").lower() == input_str
    name_matches = admin.get("name", "").lower() == input_str

    if not email_matches and not name_matches:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="بيانات الدخول غير صحيحة",
        )

    if not verify_password(req.password, admin.get("passwordHash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="بيانات الدخول غير صحيحة",
        )

    token = create_access_token({
        "id": admin.get("id"),
        "email": admin.get("email"),
        "name": admin.get("name"),
    })

    return {
        "token": token,
        "user": {
            "id": admin.get("id"),
            "name": admin.get("name"),
            "email": admin.get("email"),
        },
    }

@router.get("/auth/me")
def get_me(current_user: dict = Depends(get_current_admin)):
    db = get_db()
    admin = db.get("admin", {})
    if not admin.get('email') or not admin.get('passwordHash'):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Admin credentials are not configured')
    return {
        "id": admin.get("id"),
        "name": admin.get("name"),
        "email": admin.get("email"),
    }

@router.put("/auth/profile")
def update_profile(req: ProfileUpdateRequest, current_user: dict = Depends(get_current_admin)):
    db = get_db()
    admin = db.get("admin", {})
    if not admin.get('email') or not admin.get('passwordHash'):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Admin credentials are not configured')

    if req.currentPassword and req.newPassword:
        if not verify_password(req.currentPassword, admin.get("passwordHash", "")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )
        admin["passwordHash"] = hash_password(req.newPassword)

    if req.name:
        admin["name"] = req.name
    if req.email:
        admin["email"] = req.email

    db["admin"] = admin
    save_db(db)

    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": {
            "id": admin.get("id"),
            "name": admin.get("name"),
            "email": admin.get("email"),
        },
    }
