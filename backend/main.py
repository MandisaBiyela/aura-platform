"""Aura platform FastAPI application entry point."""

from pathlib import Path
from typing import TypedDict

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(_ROOT / ".env")

from backend.auth import router as auth_router  # noqa: E402 — after load_dotenv
from backend.devices import router as devices_router  # noqa: E402

app = FastAPI(title="Aura Platform")
app.include_router(auth_router)
app.include_router(devices_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(TypedDict):
    status: str
    service: str


@app.get("/health")
def health() -> HealthResponse:
    return {"status": "ok", "service": "aura-platform"}
