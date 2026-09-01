"""Pydantic schemas for admin dashboard endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.subscription import PlanType
from app.models.user import UserRole


class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_subscriptions: int
    active_subscriptions: int
    free_users: int
    pro_users: int
    enterprise_users: int
    monthly_revenue_cents: int
    ai_requests_this_month: int
    document_count: int


class AdminUserRead(BaseModel):
    """UserRead plus the fields the admin UI needs that live on other tables (plan)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    plan: PlanType


class AdminSubscriptionRead(BaseModel):
    """SubscriptionRead plus the customer identity fields the admin UI needs."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    user_email: EmailStr
    user_full_name: str
    plan: PlanType
    billing_cycle: str
    status: str
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool


class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: Optional[uuid.UUID]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    log_metadata: Optional[dict[str, Any]]
    created_at: datetime


class AdminAuditLogRead(AuditLogRead):
    """AuditLogRead plus the acting user's display name, resolved via a join."""

    user_full_name: Optional[str] = None


class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[Any]
