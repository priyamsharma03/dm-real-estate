from fastapi import APIRouter, Depends

from ..models.auth import AuthSession, LoginRequest
from ..models.user import UserProfile
from ..services.auth_service import authenticate, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=AuthSession)
def login(payload: LoginRequest) -> AuthSession:
    return authenticate(payload)


@router.get("/me", response_model=UserProfile)
def get_me(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    return current_user
