from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..core.database import engine
from ..models.property import Property, PropertyCreate, PropertyRead, PropertyUpdate
from ..models.user import UserProfile
from ..services.auth_service import get_optional_user, require_admin

router = APIRouter(prefix="/api/properties", tags=["properties"])


@router.get("", response_model=list[PropertyRead])
def list_properties(
    current_user: Optional[UserProfile] = Depends(get_optional_user),
    type: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    max_price: Optional[int] = Query(default=None, ge=0),
    sort: Optional[str] = Query(default=None),
    featured: Optional[bool] = Query(default=None),
    limit: Optional[int] = Query(default=None, ge=1),
) -> list[PropertyRead]:
    statement = select(Property)

    if type:
        statement = statement.where(Property.type == type)

    if location:
        statement = statement.where(Property.location.contains(location))

    if max_price is not None:
        statement = statement.where(Property.price <= max_price)

    if featured is not None:
        statement = statement.where(Property.featured == featured)

    if sort == "priceAsc":
        statement = statement.order_by(Property.price.asc())
    elif sort == "priceDesc":
        statement = statement.order_by(Property.price.desc())

    if limit:
        statement = statement.limit(limit)

    with Session(engine) as session:
        return session.exec(statement).all()


@router.get("/{property_id}", response_model=PropertyRead)
def get_property(
    property_id: str,
    current_user: Optional[UserProfile] = Depends(get_optional_user),
) -> PropertyRead:
    with Session(engine) as session:
        property_item = session.get(Property, property_id)
        if not property_item:
            raise HTTPException(status_code=404, detail="Property not found")
        return property_item


@router.post("", response_model=PropertyRead)
def create_property(
    payload: PropertyCreate,
    current_user: UserProfile = Depends(require_admin),
) -> PropertyRead:
    with Session(engine) as session:
        property_item = Property(**payload.model_dump())
        session.add(property_item)
        session.commit()
        session.refresh(property_item)
        return property_item


@router.put("/{property_id}", response_model=PropertyRead)
def update_property(
    property_id: str,
    payload: PropertyUpdate,
    current_user: UserProfile = Depends(require_admin),
) -> PropertyRead:
    with Session(engine) as session:
        property_item = session.get(Property, property_id)
        if not property_item:
            raise HTTPException(status_code=404, detail="Property not found")

        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(property_item, key, value)

        session.add(property_item)
        session.commit()
        session.refresh(property_item)
        return property_item


@router.delete("/{property_id}")
def delete_property(
    property_id: str,
    current_user: UserProfile = Depends(require_admin),
) -> dict:
    with Session(engine) as session:
        property_item = session.get(Property, property_id)
        if not property_item:
            raise HTTPException(status_code=404, detail="Property not found")

        session.delete(property_item)
        session.commit()
        return {"ok": True}
