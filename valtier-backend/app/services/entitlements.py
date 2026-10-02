"""Subscription plan entitlements — shared gates for AI, RAG, and memory."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, SubscriptionRequiredError
from app.models.subscription import PlanType, Subscription, SubscriptionStatus
from app.models.user import User
from app.schemas.subscription import PlanFeatures
from app.services.plan_catalog import PLAN_CATALOG
from app.services import subscription_service

PAID_STATUSES = frozenset({SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING})


def plan_features_for_user(db: Session, user: User) -> tuple[Subscription, PlanFeatures]:
    subscription = subscription_service.get_subscription_for_user(db, user)
    return subscription, PLAN_CATALOG[subscription.plan]


def ensure_subscription_active(subscription: Subscription) -> None:
    if subscription.status not in PAID_STATUSES:
        raise ForbiddenError(
            f"Your subscription is {subscription.status.value}. Please update billing to access this feature."
        )


def ensure_ai_execution(db: Session, user: User) -> tuple[Subscription, PlanFeatures]:
    subscription, features = plan_features_for_user(db, user)
    ensure_subscription_active(subscription)
    if subscription.plan == PlanType.FREE:
        raise SubscriptionRequiredError(
            "AI agent execution requires a paid subscription. Upgrade to Pro or Business to continue."
        )
    return subscription, features


def ensure_rag_access(db: Session, user: User) -> tuple[Subscription, PlanFeatures]:
    subscription, features = plan_features_for_user(db, user)
    ensure_subscription_active(subscription)
    if not features.includes_rag:
        raise ForbiddenError(
            "Enterprise Knowledge (RAG) requires a Pro or Business subscription. Upgrade to access document upload."
        )
    return subscription, features


def ensure_memory_access(db: Session, user: User) -> tuple[Subscription, PlanFeatures]:
    subscription, features = plan_features_for_user(db, user)
    ensure_subscription_active(subscription)
    if not features.includes_memory:
        raise ForbiddenError("Long-term memory requires a Pro or Business subscription.")
    return subscription, features
