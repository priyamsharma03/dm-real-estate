from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..core.database import engine
from ..models.property import Property
from ..models.user import UserProfile
from ..services.auth_service import get_optional_user

router = APIRouter(prefix="/api/locations", tags=["locations"])


@router.get("", response_model=list[str])
def list_locations(current_user: Optional[UserProfile] = Depends(get_optional_user)) -> list[str]:
    with Session(engine) as session:
        locations = session.exec(select(Property.location)).all()

    return sorted({location for location in locations})
