"""Pytest configuration: test DATABASE_URL, fresh schema per test, shared TestClient."""

from __future__ import annotations

import os
import tempfile
from collections.abc import Generator
from pathlib import Path

import pytest
from sqlalchemy import event

# Auth and DB must exist before any backend package imports (they read env at import time).
os.environ.setdefault(
    "SECRET_KEY",
    "pytest-secret-key-do-not-use-in-production-32bytes",
)
if "DATABASE_URL" not in os.environ:
    _tmp = Path(tempfile.mkdtemp(prefix="aura_pytest_")) / "test.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{_tmp.as_posix()}"

from backend.base import Base  # noqa: E402 — after env
from backend.database import engine  # noqa: E402
import backend.models  # noqa: F401, E402 — register ORM tables on Base.metadata


@event.listens_for(engine, "connect")
def _sqlite_enable_foreign_keys(dbapi_connection, _connection_record) -> None:
    if engine.dialect.name == "sqlite":
        dbapi_connection.execute("PRAGMA foreign_keys=ON")


@pytest.fixture(autouse=True)
def _reset_database() -> Generator[None, None, None]:
    """Each test starts with an empty schema and leaves no rows behind."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client() -> Generator:
    # Import app only after env and metadata hooks are configured.
    from fastapi.testclient import TestClient

    from backend.main import app

    with TestClient(app) as c:
        yield c
