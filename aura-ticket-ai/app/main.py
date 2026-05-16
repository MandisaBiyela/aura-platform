"""Aura ticket AI classifier microservice."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.predict import classify, load_classifier
from app.schemas import ClassifyRequest, ClassifyResponse

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if load_classifier():
        logger.info("Classifier loaded")
    else:
        logger.warning(
            "Model file missing at models/classifier.pkl; "
            "classify will return unclassified"
        )
    yield


app = FastAPI(title="Aura Ticket AI", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "aura-ticket-ai"}


@app.post("/classify", response_model=ClassifyResponse)
def classify_ticket(body: ClassifyRequest) -> ClassifyResponse:
    return classify(body.text)
