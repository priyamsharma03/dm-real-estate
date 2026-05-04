from datetime import datetime
from uuid import uuid4

from sqlmodel import Field, SQLModel


class InquiryBase(SQLModel):
    name: str
    email: str | None = None
    phone: str | None = None
    message: str | None = None
    propertyId: str | None = None
    propertyTitle: str | None = None
    source: str | None = None


class Inquiry(InquiryBase, table=True):
    id: str = Field(default_factory=lambda: f"inq-{uuid4().hex[:8]}", primary_key=True)
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class InquiryRead(InquiryBase):
    id: str
    createdAt: str


class InquiryRequest(InquiryBase):
    pass
