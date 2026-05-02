"""
api.py — FastAPI application entry point.

Responsibilities (and nothing more):
  • Create the FastAPI app with metadata
  • Configure CORS middleware
  • Register routers
  • Load ML artifacts at startup via lifespan context
  • Expose a /health check

Run with:
    python -m uvicorn backend.api:app --reload
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.routers import auth, sentiment
from backend.services import sentiment_service
from backend.models.schemas import HealthResponse

# ── Logging configuration ────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifespan: load artifacts once at startup ─────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀  Starting up %s v%s …", settings.app_title, settings.app_version)
    sentiment_service.load_artifacts()
    yield
    logger.info("🛑  Shutting down.")


# ── App factory ──────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_title,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan,
)

# ── Middleware ───────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
# Keep legacy /login and /predict paths so the existing frontend keeps working.
app.include_router(auth.router)
app.include_router(sentiment.router)

# Legacy flat routes (no prefix) — forward to the same handlers
from backend.models.schemas import LoginRequest, LoginResponse, SentimentRequest, SentimentResponse
from backend.services.auth_service import verify_user
from fastapi import HTTPException, status

@app.post("/login", response_model=LoginResponse, tags=["Legacy"], include_in_schema=True)
def legacy_login(data: LoginRequest) -> LoginResponse:
    """Backwards-compatible /login alias (used by the existing frontend)."""
    if verify_user(data.username, data.password):
        return LoginResponse(status="success", message="Login successful")
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@app.post("/predict", response_model=SentimentResponse, tags=["Legacy"], include_in_schema=True)
def legacy_predict(data: SentimentRequest) -> SentimentResponse:
    """Backwards-compatible /predict alias (used by the existing frontend)."""
    if not sentiment_service.is_ready():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model not ready")
    label = sentiment_service.predict_sentiment(data.text)
    return SentimentResponse(sentiment=label, input_text=data.text)


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health() -> HealthResponse:
    """Liveness probe — returns 200 once the API is running."""
    return HealthResponse(status="ok", message="API is running")


@app.get("/", response_model=HealthResponse, tags=["Health"])
def root() -> HealthResponse:
    return HealthResponse(status="ok", message=f"{settings.app_title} is running")