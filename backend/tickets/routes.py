"""Ticket CRUD and status routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.auth.deps import get_current_user
from backend.database import get_db
from backend.models import Device, Ticket, User
from backend.tickets.enums import TicketPriority, TicketStatus
from backend.tickets.schemas import (
    TicketClassifyRequest,
    TicketClassifyResponse,
    TicketCreate,
    TicketResponse,
    TicketStatusPatch,
)
from backend.tickets.service import (
    classify_and_update_ticket,
    create_ticket_record,
    fetch_classification,
    ticket_classification_text,
)

router = APIRouter(prefix="/tickets", tags=["tickets"])


def _active_device_or_404(db: Session, device_id: int) -> Device:
    device = db.get(Device, device_id)
    if device is None or not device.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return device


@router.get("", response_model=list[TicketResponse])
def list_tickets(
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
    status_filter: Annotated[TicketStatus | None, Query(alias="status")] = None,
    priority_filter: Annotated[TicketPriority | None, Query(alias="priority")] = None,
) -> list[Ticket]:
    stmt = select(Ticket)
    if status_filter is not None:
        stmt = stmt.where(Ticket.status == status_filter)
    if priority_filter is not None:
        stmt = stmt.where(Ticket.priority == priority_filter)
    return list(db.scalars(stmt.order_by(Ticket.id)).all())


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    body: TicketCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Ticket:
    _active_device_or_404(db, body.device_id)
    ticket = create_ticket_record(
        db,
        title=body.title,
        description=body.description,
        status=body.status,
        priority=body.priority,
        device_id=body.device_id,
        created_by=current_user.id,
    )
    return await classify_and_update_ticket(
        db, ticket, ticket_classification_text(ticket)
    )


@router.post("/classify", response_model=TicketClassifyResponse)
async def classify_ticket_text(
    body: TicketClassifyRequest,
    _current_user: Annotated[User, Depends(get_current_user)],
) -> TicketClassifyResponse:
    """Preview classification for arbitrary ticket text (Classifier UI)."""
    text = body.text.strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text is required",
        )
    result = await fetch_classification(text)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Ticket classifier service is unavailable. "
                "Start aura-ticket-ai on port 8001 and set AI_SERVICE_URL in .env."
            ),
        )
    return TicketClassifyResponse(**result)


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.patch("/{ticket_id}/status", response_model=TicketResponse)
def patch_ticket_status(
    ticket_id: int,
    body: TicketStatusPatch,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    ticket.status = body.status
    db.commit()
    db.refresh(ticket)
    return ticket
