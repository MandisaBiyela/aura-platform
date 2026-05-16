"""Load the trained model and run inference."""

from pathlib import Path

import joblib

_MODELS_DIR = Path(__file__).resolve().parents[1] / "models"
_MODEL_PATH = _MODELS_DIR / "ticket_classifier.joblib"

_pipeline = None
_DEFAULT_CATEGORY = "general"


def _load_pipeline():
    global _pipeline
    if _pipeline is not None:
        return _pipeline
    if not _MODEL_PATH.is_file():
        return None
    _pipeline = joblib.load(_MODEL_PATH)
    return _pipeline


def predict(text: str) -> tuple[str, float]:
    """Return (category, confidence). Uses a fallback when no model is trained yet."""
    pipeline = _load_pipeline()
    if pipeline is None:
        return _DEFAULT_CATEGORY, 0.0

    proba = pipeline.predict_proba([text])[0]
    classes = list(pipeline.classes_)
    best_idx = int(proba.argmax())
    return classes[best_idx], float(proba[best_idx])
