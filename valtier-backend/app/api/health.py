"""Health check endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import check_db_connection, get_db

router = APIRouter(tags=["health"])


@router.get("/health", summary="Liveness check")
def health() -> dict:
    return {"status": "healthy", "service": "valtier-backend"}


@router.get("/health/deep", summary="Deep health check including database connectivity")
def deep_health(db: Session = Depends(get_db)) -> dict:
    db_ok = check_db_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "valtier-backend",
        "database": "connected" if db_ok else "unreachable",
    }
