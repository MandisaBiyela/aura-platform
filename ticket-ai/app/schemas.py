"""Request/response models for the ticket classifier API."""

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Ticket title and/or description combined")


class PredictResponse(BaseModel):
    category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
