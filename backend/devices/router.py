"""Device CRUD routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.auth.deps import get_current_user
from backend.database import get_db
from backend.devices.schemas import DeviceCreate, DeviceResponse, DeviceUpdate
from backend.models import Device, User

router = APIRouter(prefix="/devices", tags=["devices"])


def _active_device_or_404(db: Session, device_id: int) -> Device:
    device = db.get(Device, device_id)
    if device is None or not device.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return device


@router.get("", response_model=list[DeviceResponse])
def list_devices(
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
    status_filter: Annotated[str | None, Query(alias="status")] = None,
) -> list[Device]:
    stmt = select(Device).where(Device.is_active.is_(True))
    if status_filter is not None:
        stmt = stmt.where(Device.status == status_filter)
    return list(db.scalars(stmt.order_by(Device.id)).all())


@router.post("", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
def create_device(
    body: DeviceCreate,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
) -> Device:
    device = Device(
        name=body.name,
        serial_number=body.serial_number,
        status=body.status,
        location=body.location,
        is_active=True,
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(
    device_id: int,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
) -> Device:
    return _active_device_or_404(db, device_id)


@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(
    device_id: int,
    body: DeviceUpdate,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
) -> Device:
    device = _active_device_or_404(db, device_id)
    device.name = body.name
    device.serial_number = body.serial_number
    device.status = body.status
    device.location = body.location
    db.commit()
    db.refresh(device)
    return device


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(
    device_id: int,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    device = db.get(Device, device_id)
    if device is None or not device.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    device.is_active = False
    db.commit()
