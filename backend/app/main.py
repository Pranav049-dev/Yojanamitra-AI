from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.database.session import SessionLocal, Base, engine
from app.seed_data import init_db

# Import routers
from app.api.routes import (
    health,
    auth,
    schemes,
    eligibility,
    saved,
    assistant,
    investigation,
    comparison,
    documents,
    verification,
    profile
)

setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing YojanaMitra AI Backend...")
    # Initialize DB & Seed Data & RAG
    db = SessionLocal()
    try:
        init_db(db)
        logger.info("Database and RAG index initialized successfully.")
    except Exception as e:
        logger.error(f"Error during startup initialization: {e}")
    finally:
        db.close()
    yield
    logger.info("Shutting down YojanaMitra AI Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="YojanaMitra AI — AI-powered Indian Government Scheme Discovery, Investigation, and Verification Platform.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under API prefix
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(schemes.router, prefix=settings.API_PREFIX)
app.include_router(eligibility.router, prefix=settings.API_PREFIX)
app.include_router(saved.router, prefix=settings.API_PREFIX)
app.include_router(assistant.router, prefix=settings.API_PREFIX)
app.include_router(investigation.router, prefix=settings.API_PREFIX)
app.include_router(comparison.router, prefix=settings.API_PREFIX)
app.include_router(documents.router, prefix=settings.API_PREFIX)
app.include_router(verification.router, prefix=settings.API_PREFIX)
app.include_router(profile.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "message": "Welcome to YojanaMitra AI API",
        "tagline": "Discover. Understand. Investigate. Benefit.",
        "docs": "/docs",
        "health": "/api/health"
    }
