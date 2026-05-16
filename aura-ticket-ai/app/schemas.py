"""Request/response models for the ticket classifier API."""

from pydantic import BaseModel, Field


class ClassifyRequest(BaseModel):
    text: str


class ClassifyResponse(BaseModel):
    category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    all_scores: dict[str, float]
