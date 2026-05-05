from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlmodel import Field, SQLModel
from typing import Optional



class PropertyBase(SQLModel):
    title: str
    type: str
    price: int
    width: Optional[float] = None
    length: Optional[float] = None
    location: str
    shortDescription: str
    description: str
    amenities: list[str] = Field(sa_column=Column(SQLiteJSON))
    images: list[str] = Field(sa_column=Column(SQLiteJSON))
    featured: bool = False


class Property(PropertyBase, table=True):
    id: str = Field(default_factory=lambda: f"p-{uuid4().hex[:8]}", primary_key=True)
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(SQLModel):
    title: str | None = None
    type: str | None = None
    price: int | None = None
    width: float | None = None
    length: float | None = None
    location: str | None = None
    shortDescription: str | None = None
    description: str | None = None
    amenities: list[str] | None = None
    images: list[str] | None = None
    featured: bool | None = None


class PropertyRead(PropertyBase):
    id: str
    createdAt: str
