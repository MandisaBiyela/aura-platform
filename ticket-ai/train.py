"""Train ticket category classifier from data/training_data.csv."""

import csv
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

DATA_PATH = Path(__file__).resolve().parent / "data" / "training_data.csv"
MODEL_PATH = Path(__file__).resolve().parent / "models" / "classifier.pkl"


def load_data() -> tuple[list[str], list[str]]:
    texts: list[str] = []
    labels: list[str] = []
    with DATA_PATH.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row["text"].strip())
            labels.append(row["label"].strip())
    return texts, labels


def main() -> None:
    texts, labels = load_data()

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
            ("clf", LogisticRegression(max_iter=1000)),
        ]
    )
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred))

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)

    accuracy = accuracy_score(y_test, y_pred) * 100
    print(f"Model saved. Accuracy: {accuracy:.1f}%")


if __name__ == "__main__":
    main()
