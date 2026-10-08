import os
import time
import json
import hmac
import hashlib
import base64
import secrets
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from .database import get_db


def get_jwt_secret() -> str:
    secret = os.environ.get("JWT_SECRET", "").strip()
    if len(secret) < 32:
        raise RuntimeError("JWT_SECRET must be configured with at least 32 characters")
    return secret


def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def b64url_decode(value: str) -> bytes:
    padding = "=" * (4 - (len(value) % 4)) if len(value) % 4 else ""
    return base64.urlsafe_b64decode(value + padding)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        import bcrypt
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except (ImportError, ValueError, TypeError):
        # Legacy salted SHA-256 hashes are accepted for migration compatibility.
        if hashed_password.startswith("sha256$"):
            parts = hashed_password.split("$")
            return len(parts) == 3 and hmac.compare_digest(
                hashlib.sha256((parts[1] + plain_password).encode("utf-8")).hexdigest(), parts[2]
            )
        return False


def hash_password(plain_password: str) -> str:
    import bcrypt
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: Dict[str, Any], expires_in_days: int = 1) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_in_days * 86400
    h_b64 = b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    p_b64 = b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{h_b64}.{p_b64}"
    signature = hmac.new(get_jwt_secret().encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
    return f"{signing_input}.{b64url_encode(signature)}"


def verify_access_token(token: str) -> Dict[str, Any]:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token format")
    h_b64, p_b64, signature = parts
    header = json.loads(b64url_decode(h_b64).decode("utf-8"))
    if header.get("alg") != "HS256":
        raise ValueError("Unsupported token algorithm")
    signing_input = f"{h_b64}.{p_b64}"
    expected = b64url_encode(hmac.new(get_jwt_secret().encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest())
    if not hmac.compare_digest(signature, expected):
        raise ValueError("Invalid token signature")
    payload = json.loads(b64url_decode(p_b64).decode("utf-8"))
    if not isinstance(payload.get("exp"), (int, float)) or time.time() >= payload["exp"]:
        raise ValueError("Token expired or missing expiration")
    return payload


def get_current_admin(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized: Missing or invalid token")
    try:
        decoded = verify_access_token(authorization.split(" ", 1)[1])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized: Invalid token session")
    admin = get_db().get("admin", {})
    if not admin.get("id") or not admin.get("passwordHash") or decoded.get("id") != admin.get("id"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized: Admin session is no longer valid")
    return {"id": admin["id"], "name": admin.get("name"), "email": admin.get("email")}
