"""Aura platform FastAPI application entry point."""

import inspect
import os
from pathlib import Path
from typing import TypedDict

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(_ROOT / ".env")

from backend.auth import router as auth_router  # noqa: E402 — after load_dotenv
from backend.devices import router as devices_router  # noqa: E402
from backend.tickets import router as tickets_router  # noqa: E402

app = FastAPI(title="Aura Platform")
app.include_router(auth_router)
app.include_router(devices_router)
app.include_router(tickets_router)

# Local Vite may bind to any free port (5173, 5190, 5191, …). Regex covers all; add
# BACKEND_CORS_ORIGINS=https://app.example.com for deployed frontends (comma-separated).
_extra_cors = [
    o.strip()
    for o in os.getenv("BACKEND_CORS_ORIGINS", "").split(",")
    if o.strip()
]
_localhost_origin_regex = r"https?://(localhost|127\.0\.0\.1)(:\d+)?$"

_cors_kwargs: dict = {
    "allow_origins": _extra_cors,
    "allow_origin_regex": _localhost_origin_regex,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}
# Newer Starlette only; omit on older installs so tests and dev servers still start.
if "allow_private_network" in inspect.signature(CORSMiddleware.__init__).parameters:
    _cors_kwargs["allow_private_network"] = True

app.add_middleware(CORSMiddleware, **_cors_kwargs)


class HealthResponse(TypedDict):
    status: str
    service: str


@app.get("/health")
def health() -> HealthResponse:
    return {"status": "ok", "service": "aura-platform"}
