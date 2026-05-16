"""Ticket business logic and AI classification integration."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy.orm import Session

from backend.config import AI_SERVICE_URL
from backend.database import SessionLocal
from backend.models import Ticket
from backend.tickets.enums import TicketPriority, TicketStatus

logger = logging.getLogger(__name__)

_CLASSIFY_TIMEOUT = 3.0


def ticket_classification_text(ticket: Ticket) -> str:
    return f"{ticket.title}. {ticket.description}"


async def fetch_classification(text: str, *, ticket_id: int | None = None) -> dict | None:
    """Call aura-ticket-ai; returns category, confidence, and optional all_scores."""
    try:
        async with httpx.AsyncClient(timeout=_CLASSIFY_TIMEOUT) as client:
            response = await client.post(
                f"{AI_SERVICE_URL}/classify",
                json={"text": text},
            )
            response.raise_for_status()
            payload = response.json()
        all_scores = payload.get("all_scores")
        return {
            "category": str(payload["category"]),
            "confidence": float(payload["confidence"]),
            "all_scores": (
                {str(k): float(v) for k, v in all_scores.items()}
                if isinstance(all_scores, dict)
                else {}
            ),
        }
    except Exception:
        logger.exception(
            "AI classification failed for ticket_id=%s (service=%s)",
            ticket_id,
            AI_SERVICE_URL,
        )
        return None


async def classify_and_update_ticket(db: Session, ticket: Ticket, text: str) -> Ticket:
    """Classify in-process (up to 3s); never raises — returns ticket unchanged on failure."""
    result = await fetch_classification(text, ticket_id=ticket.id)
    if result is None:
        return ticket
    category = result["category"]
    confidence = result["confidence"]
    try:
        ticket.ai_category = category
        ticket.ai_confidence = confidence
        ticket.ai_classified_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(ticket)
    except Exception:
        logger.exception("Failed to save AI classification for ticket_id=%s", ticket.id)
        db.rollback()
    return ticket


async def classify_ticket_async(ticket_id: int, text: str) -> None:
    """Background-friendly wrapper; never raises to the caller."""
    db = SessionLocal()
    try:
        ticket = db.get(Ticket, ticket_id)
        if ticket is None:
            logger.warning("Ticket %s not found when applying AI classification", ticket_id)
            return
        await classify_and_update_ticket(db, ticket, text)
    finally:
        db.close()


def create_ticket_record(
    db: Session,
    *,
    title: str,
    description: str | None,
    status: TicketStatus,
    priority: TicketPriority,
    device_id: int,
    created_by: int,
) -> Ticket:
    ticket = Ticket(
        title=title,
        description=description,
        status=status,
        priority=priority,
        device_id=device_id,
        created_by=created_by,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket
