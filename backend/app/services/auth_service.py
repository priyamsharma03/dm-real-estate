import secrets
import time
from typing import Optional

from fastapi import Depends, Header, HTTPException

from ..core.config import SESSION_TTL_MS
from ..data.mock_users import MOCK_USERS
from ..models.auth import AuthSession, LoginRequest
from ..models.user import UserProfile

SESSIONS: dict[str, dict[str, object]] = {}


def parse_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header.")

    return token


def build_user_profile(account: dict[str, str]) -> UserProfile:
    return UserProfile(
        id=account["id"],
        name=account["name"],
        email=account["email"],
        phone=account["phone"],
        role=account["role"],
    )


def create_session(user: UserProfile) -> AuthSession:
    token = secrets.token_urlsafe(32)
    expires_at = int(time.time() * 1000) + SESSION_TTL_MS

    SESSIONS[token] = {
        "user": user,
        "expires_at": expires_at,
    }

    return AuthSession(token=token, user=user, expiresAt=expires_at)


def resolve_user(token: str) -> UserProfile:
    session_data = SESSIONS.get(token)

    if not session_data:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

    expires_at = int(session_data["expires_at"])
    if expires_at <= int(time.time() * 1000):
        SESSIONS.pop(token, None)
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

    return session_data["user"]


def get_current_user(authorization: Optional[str] = Header(None)) -> UserProfile:
    token = parse_bearer_token(authorization)

    if not token:
        raise HTTPException(status_code=401, detail="Authentication required.")

    return resolve_user(token)


def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[UserProfile]:
    token = parse_bearer_token(authorization)

    if not token:
        return None

    try:
        return resolve_user(token)
    except HTTPException:
        return None


def require_admin(user: UserProfile = Depends(get_current_user)) -> UserProfile:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only.")

    return user


def authenticate(payload: LoginRequest) -> AuthSession:
    account = next(
        (
            user
            for user in MOCK_USERS
            if user["email"].lower() == payload.email.lower()
            and user["password"] == payload.password
            and (payload.role is None or user["role"] == payload.role)
        ),
        None,
    )

    if not account:
        raise HTTPException(status_code=401, detail="Invalid email, password, or role.")

    user = build_user_profile(account)
    return create_session(user)
