"""
train_model.py — Train and persist the sentiment model.

Usage:
    # From project root:
    python backend/train_model.py
    python backend/train_model.py --data data/my_custom_data.csv

Output artifacts are saved to backend/artifacts/.
"""

import argparse
import logging
import pickle
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Paths ────────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA = PROJECT_ROOT / "data" / "sample_data.csv"
ARTIFACTS_DIR = PROJECT_ROOT / "backend" / "artifacts"


def train(data_path: Path) -> None:
    logger.info("Loading data from %s …", data_path)
    df = pd.read_csv(data_path)

    if "text" not in df.columns or "sentiment" not in df.columns:
        raise ValueError("CSV must contain 'text' and 'sentiment' columns.")

    df["text"] = df["text"].str.strip().str.lower()
    df.dropna(subset=["text", "sentiment"], inplace=True)

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["sentiment"], test_size=0.2, random_state=42
    )

    logger.info("Fitting TF-IDF vectorizer …")
    vectorizer = TfidfVectorizer()
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    logger.info("Training Logistic Regression model …")
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_vec, y_train)

    # ── Evaluation ──────────────────────────────────────────────────────────
    y_pred = model.predict(X_test_vec)
    report = classification_report(y_test, y_pred)
    logger.info("Classification report:\n%s", report)

    # ── Persist ─────────────────────────────────────────────────────────────
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = ARTIFACTS_DIR / "model.pkl"
    vec_path = ARTIFACTS_DIR / "vectorizer.pkl"

    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    with open(vec_path, "wb") as f:
        pickle.dump(vectorizer, f)

    logger.info("✅  Model saved  → %s", model_path)
    logger.info("✅  Vectorizer   → %s", vec_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the sentiment model.")
    parser.add_argument(
        "--data",
        type=Path,
        default=DEFAULT_DATA,
        help="Path to the training CSV (default: data/sample_data.csv)",
    )
    args = parser.parse_args()
    train(args.data)