"""Authenticated dashboard summary endpoint — real user + usage data, no placeholders."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import get_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse, summary="Get the current user's dashboard summary")
def dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> DashboardResponse:
    return get_dashboard_summary(db, current_user)
