"""Declarative base for ORM models (no engine — safe for Alembic imports)."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for ORM models."""
