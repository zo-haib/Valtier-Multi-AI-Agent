"""
Valtier — FastAPI SaaS backend entry point.

Wires together CORS, exception handlers, and every API router under
the configured API prefix.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, agents, auth, conversations, dashboard, documents, health, memory, payments, projects, subscriptions, users
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.limiter import limiter
from app.utils.logging import configure_logging, get_logger
from app.middleware.request_id import RequestIDMiddleware

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

configure_logging()
logger = get_logger("APP")

app = FastAPI(
    title=settings.app_name,
    description="Multi-Agent AI Workforce Platform — FastAPI SaaS backend.",
    version="1.0.0",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
)

app.state.limiter = limiter
app.add_middleware(RequestIDMiddleware)
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
app.include_router(projects.router, prefix=settings.api_v1_prefix)
app.include_router(admin.router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
def on_startup() -> None:
    problems = settings.validate_secrets()
    for problem in problems:
        logger.warning(problem)
    logger.info(f"{settings.app_name} backend started ({settings.environment})")
