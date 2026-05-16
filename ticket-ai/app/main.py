"""Ticket NLP classifier microservice (Phase 2)."""

from fastapi import FastAPI

from app.predict import predict
from app.schemas import PredictRequest, PredictResponse

app = FastAPI(title="Aura Ticket Classifier", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ticket-ai"}


@app.post("/predict", response_model=PredictResponse)
def predict_category(body: PredictRequest) -> PredictResponse:
    category, confidence = predict(body.text)
    return PredictResponse(category=category, confidence=confidence)


@app.post("/classify", response_model=PredictResponse)
def classify_ticket(body: PredictRequest) -> PredictResponse:
    """Alias for the Aura backend integration (same contract as aura-ticket-ai)."""
    return predict_category(body)
