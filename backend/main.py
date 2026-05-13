"""Aura platform FastAPI application entry point."""

from typing import TypedDict

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

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
