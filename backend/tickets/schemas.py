"""Pydantic schemas for ticket endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field

from backend.tickets.enums import TicketPriority, TicketStatus


class TicketCreate(BaseModel):
    device_id: int = Field(ge=1)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    priority: TicketPriority = TicketPriority.MEDIUM
    status: TicketStatus = TicketStatus.OPEN


class TicketStatusPatch(BaseModel):
    status: TicketStatus


class TicketClassifyRequest(BaseModel):
    text: str = Field(min_length=1, max_length=8000)


class TicketClassifyResponse(BaseModel):
    category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    all_scores: dict[str, float] = Field(default_factory=dict)


class TicketResponse(BaseModel):
    id: int
    title: str
    description: str | None
    status: TicketStatus
    priority: TicketPriority
    device_id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    ai_category: str | None = None
    ai_confidence: float | None = None
    ai_classified_at: datetime | None = None

    model_config = {"from_attributes": True}
