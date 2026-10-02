"""
Admin dashboard endpoints. Every route here depends on
get_current_admin_user, so a non-admin user gets a 403 automatically.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, Request, status
from starlette.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import select as sa_select

from app.core.database import get_db
from app.core.dependencies import get_client_ip, get_current_admin_user
from app.models.user import User
from app.schemas.admin import AdminAuditLogRead, AdminSubscriptionRead, AdminUserRead, DashboardStats, PaginatedResponse, FeatureFlagCreate, FeatureFlagUpdate, FeatureFlagRead, AgentConfigUpdate, AgentConfigRead
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


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_user(
    user_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
) -> Response:
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
    return Response(status_code=status.HTTP_204_NO_CONTENT)


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

@router.get("/feature-flags", response_model=list[FeatureFlagRead])
def list_feature_flags(db: Session = Depends(get_db)) -> list[FeatureFlagRead]:
    from app.models.feature_flag import FeatureFlag
    return list(db.scalars(sa_select(FeatureFlag)))

@router.post("/feature-flags", response_model=FeatureFlagRead, status_code=status.HTTP_201_CREATED)
def create_feature_flag(payload: FeatureFlagCreate, db: Session = Depends(get_db)) -> FeatureFlagRead:
    from app.models.feature_flag import FeatureFlag
    from app.core.exceptions import ConflictError
    
    existing = db.get(FeatureFlag, payload.key)
    if existing:
        raise ConflictError("Feature flag with this key already exists")
    
    flag = FeatureFlag(key=payload.key, enabled=payload.enabled, description=payload.description)
    db.add(flag)
    db.commit()
    db.refresh(flag)
    return flag

@router.patch("/feature-flags/{key}", response_model=FeatureFlagRead)
def update_feature_flag(key: str, payload: FeatureFlagUpdate, db: Session = Depends(get_db)) -> FeatureFlagRead:
    from app.models.feature_flag import FeatureFlag
    from app.core.exceptions import NotFoundError
    
    flag = db.get(FeatureFlag, key)
    if not flag:
        raise NotFoundError("Feature flag not found")
        
    if payload.enabled is not None:
        flag.enabled = payload.enabled
    if payload.description is not None:
        flag.description = payload.description
        
    from datetime import datetime, timezone
    flag.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(flag)
    return flag

@router.get("/agents", response_model=list[AgentConfigRead])
def list_agent_configs(db: Session = Depends(get_db)) -> list[AgentConfigRead]:
    from app.models.agent_config import AgentConfig
    return list(db.scalars(sa_select(AgentConfig)))

@router.patch("/agents/{agent_id}", response_model=AgentConfigRead)
def update_agent_config(agent_id: str, payload: AgentConfigUpdate, db: Session = Depends(get_db)) -> AgentConfigRead:
    from app.models.agent_config import AgentConfig
    from app.core.exceptions import NotFoundError
    
    config = db.get(AgentConfig, agent_id)
    if not config:
        config = AgentConfig(agent_id=agent_id)
        db.add(config)
        
    if payload.model is not None:
        config.model = payload.model
    if payload.temperature is not None:
        config.temperature = payload.temperature
    if payload.token_limit is not None:
        config.token_limit = payload.token_limit
    if payload.credit_cost is not None:
        config.credit_cost = payload.credit_cost
    if payload.enabled is not None:
        config.enabled = payload.enabled
    if payload.status is not None:
        config.status = payload.status
        
    from datetime import datetime, timezone
    config.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(config)
    return config

@router.get("/system-health")
def system_health(db: Session = Depends(get_db)) -> dict:
    from sqlalchemy import text
    from app.core.config import settings
    
    health_status = {"status": "ok", "db": "ok", "stripe_key": "missing", "ai_key": "missing"}
    
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        health_status["db"] = "error"
        health_status["status"] = "error"
        
    if settings.stripe_secret_key:
        health_status["stripe_key"] = "present"
        
    if settings.google_api_key:
        health_status["ai_key"] = "present"
        
    return health_status
