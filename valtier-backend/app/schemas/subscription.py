"""Pydantic schemas for subscription/plan endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.subscription import BillingCycle, PlanType, SubscriptionStatus


class PlanFeatures(BaseModel):
    plan: PlanType
    monthly_price_usd: float
    yearly_price_usd: float
    ai_requests_per_month: int
    document_limit: int
    includes_rag: bool
    includes_memory: bool
    includes_all_agents: bool
    stripe_price_id_monthly: Optional[str] = None
    stripe_price_id_yearly: Optional[str] = None


class SubscriptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    plan: PlanType
    billing_cycle: BillingCycle
    status: SubscriptionStatus
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool


class CheckoutRequest(BaseModel):
    price_id: str = Field(min_length=1)


class CheckoutResponse(BaseModel):
    checkout_url: str


class CancelSubscriptionResponse(BaseModel):
    detail: str
    cancel_at_period_end: bool
