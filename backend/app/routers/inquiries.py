from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..core.database import engine
from ..models.inquiry import Inquiry, InquiryRead, InquiryRequest
from ..models.user import UserProfile
from ..services.auth_service import require_admin

router = APIRouter(prefix="/api/inquiries", tags=["inquiries"])


@router.post("")
def submit_inquiry(payload: InquiryRequest) -> dict:
    if not payload.name:
        raise HTTPException(status_code=400, detail="Name is required.")

    if not payload.email and not payload.phone:
        raise HTTPException(status_code=400, detail="Email or phone is required.")

    with Session(engine) as session:
        inquiry = Inquiry(**payload.model_dump())
        session.add(inquiry)
        session.commit()

    return {"ok": True}


@router.get("", response_model=list[InquiryRead])
def list_inquiries(current_user: UserProfile = Depends(require_admin)) -> list[InquiryRead]:
    with Session(engine) as session:
        statement = select(Inquiry).order_by(Inquiry.createdAt.desc())
        return session.exec(statement).all()
