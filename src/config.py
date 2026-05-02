"""
config.py — Centralised application settings.

All paths and tuneable constants live here.
Override any value via environment variables (e.g. CORS_ORIGINS=http://localhost:3000).
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# ── Absolute base paths ──────────────────────────────────────────────────────
BACKEND_DIR: Path = Path(__file__).resolve().parent
ARTIFACTS_DIR: Path = BACKEND_DIR / "artifacts"
DATA_DIR: Path = BACKEND_DIR / "data"


class Settings(BaseSettings):
    """Application-wide settings (env-overridable)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # App metadata
    app_title: str = "Social Media Sentiment Analyser"
    app_description: str = (
        "Analyse the sentiment of social-media text using a trained ML model."
    )
    app_version: str = "1.0.0"

    # CORS — comma-separated list of allowed origins
    cors_origins: list[str] = ["*"]

    # Paths (can be overridden via env)
    model_path: Path = ARTIFACTS_DIR / "model.pkl"
    vectorizer_path: Path = ARTIFACTS_DIR / "vectorizer.pkl"
    users_path: Path = DATA_DIR / "users.json"


settings = Settings()
