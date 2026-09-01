"""User management service: self-service profile updates and admin user CRUD."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.user import AdminUserUpdate, UserUpdate


def update_own_profile(db: Session, user: User, payload: UserUpdate) -> User:
    if payload.full_name is not None:
        user.full_name = payload.full_name
    db.commit()
    db.refresh(user)
    return user


def get_user_or_404(db: Session, user_id: uuid.UUID) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return user


def list_users(db: Session, page: int, page_size: int) -> tuple[int, list[User]]:
    from app.utils.pagination import paginate

    stmt = select(User).order_by(User.created_at.desc())
    total, items = paginate(db, stmt, page, page_size)
    return total, list(items)


def admin_update_user(db: Session, user_id: uuid.UUID, payload: AdminUserUpdate) -> User:
    user = get_user_or_404(db, user_id)
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.is_verified is not None:
        user.is_verified = payload.is_verified
    db.commit()
    db.refresh(user)
    return user


def admin_delete_user(db: Session, user_id: uuid.UUID) -> None:
    user = get_user_or_404(db, user_id)
    db.delete(user)
    db.commit()
