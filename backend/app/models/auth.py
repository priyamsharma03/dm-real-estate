from sqlmodel import SQLModel

from .user import UserProfile


class LoginRequest(SQLModel):
    email: str
    password: str
    role: str | None = None


class AuthSession(SQLModel):
    token: str
    user: UserProfile
    expiresAt: int
