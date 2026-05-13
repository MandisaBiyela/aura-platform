"""Aura platform FastAPI application entry point."""

from pathlib import Path
from typing import TypedDict

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(_ROOT / ".env")

app = FastAPI(title="Aura Platform")

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
