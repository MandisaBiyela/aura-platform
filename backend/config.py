"""Shared backend settings loaded from the project root .env."""

import os
from pathlib import Path

from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(_ROOT / ".env")

_raw_ai_url = os.getenv("AI_SERVICE_URL") or os.getenv("AI_CLASSIFIER_URL") or "http://localhost:8001"
AI_SERVICE_URL = _raw_ai_url.rstrip("/")
