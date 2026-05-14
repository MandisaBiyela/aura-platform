"""Pydantic schemas for device endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field


class DeviceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    serial_number: str = Field(min_length=1, max_length=128)
    status: str = Field(min_length=1, max_length=64)
    location: str = Field(min_length=1, max_length=255)


class DeviceUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    serial_number: str = Field(min_length=1, max_length=128)
    status: str = Field(min_length=1, max_length=64)
    location: str = Field(min_length=1, max_length=255)


class DeviceResponse(BaseModel):
    id: int
    name: str
    serial_number: str
    status: str
    location: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
