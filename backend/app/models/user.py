from sqlmodel import SQLModel


class UserProfile(SQLModel):
    id: str
    name: str
    email: str
    phone: str
    role: str
