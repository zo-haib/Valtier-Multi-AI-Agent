"""
Valtier — FastAPI SaaS backend entry point.

Wires together CORS, exception handlers, and every API router under
the configured API prefix.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, agents, auth, conversations, dashboard, documents, health, memory, payments, subscriptions, users
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.utils.logging import configure_logging, get_logger

configure_logging()
logger = get_logger("APP")

app = FastAPI(
    title=settings.app_name,
    description="Multi-Agent AI Workforce Platform — FastAPI SaaS backend.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(health.router)
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(users.router, prefix=settings.api_v1_prefix)
app.include_router(dashboard.router, prefix=settings.api_v1_prefix)
app.include_router(agents.router, prefix=settings.api_v1_prefix)
app.include_router(conversations.router, prefix=settings.api_v1_prefix)
app.include_router(documents.router, prefix=settings.api_v1_prefix)
app.include_router(memory.router, prefix=settings.api_v1_prefix)
app.include_router(subscriptions.router, prefix=settings.api_v1_prefix)
app.include_router(payments.router, prefix=settings.api_v1_prefix)
app.include_router(admin.router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
def on_startup() -> None:
    problems = settings.validate_secrets()
    for problem in problems:
        logger.warning(problem)
    logger.info(f"{settings.app_name} backend started ({settings.environment})")
