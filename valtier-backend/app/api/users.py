"""User self-service endpoints (not admin — see api/admin.py for user management)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def get_my_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserRead)
def update_my_profile(
    payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> User:
    return user_service.update_own_profile(db, current_user, payload)
