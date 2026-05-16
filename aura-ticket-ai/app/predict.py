"""Load classifier model and run inference."""

from pathlib import Path

import joblib

from app.schemas import ClassifyResponse

_MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "classifier.pkl"

_pipeline = None


def load_classifier() -> bool:
    """Load the sklearn pipeline from disk. Returns True if loaded successfully."""
    global _pipeline
    if not _MODEL_PATH.is_file():
        _pipeline = None
        return False
    _pipeline = joblib.load(_MODEL_PATH)
    return True


def classify(text: str) -> ClassifyResponse:
    """Return top category, confidence, and per-class scores from predict_proba."""
    if _pipeline is None:
        return ClassifyResponse(
            category="unclassified",
            confidence=0.0,
            all_scores={},
        )

    proba = _pipeline.predict_proba([text])[0]
    classes = list(_pipeline.classes_)
    all_scores = {label: float(score) for label, score in zip(classes, proba)}
    best_idx = int(proba.argmax())

    return ClassifyResponse(
        category=classes[best_idx],
        confidence=float(proba[best_idx]),
        all_scores=all_scores,
    )
