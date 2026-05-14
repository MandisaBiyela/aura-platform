"""Ticket management API.

``router`` is loaded lazily (PEP 562) so importing ``backend.tickets`` during ORM
setup does not import FastAPI routes or create cycles with ``backend.auth``.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from fastapi import APIRouter

__all__ = ["router"]


def __getattr__(name: str) -> APIRouter:
    if name == "router":
        from backend.tickets.routes import router as _router

        return _router
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
