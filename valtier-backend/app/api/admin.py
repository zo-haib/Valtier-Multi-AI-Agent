"""
Admin dashboard endpoints. Every route here depends on
get_current_admin_user, so a non-admin user gets a 403 automatically.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_client_ip, get_current_admin_user
from app.models.user import User
from app.schemas.admin import AdminAuditLogRead, AdminSubscriptionRead, AdminUserRead, DashboardStats, PaginatedResponse
from app.schemas.subscription import SubscriptionRead
from app.schemas.user import AdminUserUpdate, UserRead
from app.services import admin_service, user_service
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin_user)])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)) -> DashboardStats:
    return admin_service.get_dashboard_stats(db)


@router.get("/users", response_model=PaginatedResponse)
def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    db: Session = Depends(get_db),
) -> PaginatedResponse:
    total, items = admin_service.list_users_with_plan(db, page, page_size)
    return PaginatedResponse(
        total=total, page=page, page_size=page_size, items=[AdminUserRead.model_validate(u) for u in items]
    )


@router.get("/users/{user_id}", response_model=UserRead)
def get_user(user_id: uuid.UUID, db: Session = Depends(get_db)) -> UserRead:
    return user_service.get_user_or_404(db, user_id)


@router.patch("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: uuid.UUID,
    payload: AdminUserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
) -> UserRead:
    updated = user_service.admin_update_user(db, user_id, payload)
    record_audit_event(
        db,
        action="admin_user_update",
        user_id=admin_user.id,
        resource_type="user",
        resource_id=str(user_id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
        metadata=payload.model_dump(exclude_none=True),
    )
    return updated


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
) -> None:
    user_service.admin_delete_user(db, user_id)
    record_audit_event(
        db,
        action="admin_user_deletion",
        user_id=admin_user.id,
        resource_type="user",
        resource_id=str(user_id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )


@router.get("/subscriptions", response_model=PaginatedResponse)
def list_subscriptions(
    page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=200), db: Session = Depends(get_db)
) -> PaginatedResponse:
    total, items = admin_service.list_subscriptions(db, page, page_size)
    return PaginatedResponse(
        total=total, page=page, page_size=page_size, items=[AdminSubscriptionRead.model_validate(s) for s in items]
    )


@router.get("/subscriptions/{subscription_id}", response_model=SubscriptionRead)
def get_subscription(subscription_id: uuid.UUID, db: Session = Depends(get_db)) -> SubscriptionRead:
    from app.core.exceptions import NotFoundError
    from app.models.subscription import Subscription

    subscription = db.get(Subscription, subscription_id)
    if subscription is None:
        raise NotFoundError("Subscription not found")
    return subscription


@router.get("/audit-logs", response_model=PaginatedResponse)
def list_audit_logs(
    page: int = Query(default=1, ge=1), page_size: int = Query(default=50, ge=1, le=200), db: Session = Depends(get_db)
) -> PaginatedResponse:
    total, items = admin_service.list_audit_logs(db, page, page_size)
    return PaginatedResponse(
        total=total, page=page, page_size=page_size, items=[AdminAuditLogRead.model_validate(a) for a in items]
    )
