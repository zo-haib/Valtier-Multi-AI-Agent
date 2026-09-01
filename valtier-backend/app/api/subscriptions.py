"""Subscription management endpoints — plan info, checkout, cancel, reactivate."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_client_ip, get_current_user
from app.models.user import User
from app.schemas.subscription import (
    CancelSubscriptionResponse,
    CheckoutRequest,
    CheckoutResponse,
    PlanFeatures,
    SubscriptionRead,
)
from app.services import subscription_service
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/plans", response_model=list[PlanFeatures])
def get_plans() -> list[PlanFeatures]:
    return subscription_service.list_plans()


@router.get("/me", response_model=SubscriptionRead)
def get_my_subscription(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> SubscriptionRead:
    return subscription_service.get_subscription_for_user(db, current_user)


@router.post("/create-checkout", response_model=CheckoutResponse)
def create_checkout(
    payload: CheckoutRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> CheckoutResponse:
    url = subscription_service.create_checkout_session(db, current_user, payload.price_id)
    return CheckoutResponse(checkout_url=url)


@router.post("/cancel", response_model=CancelSubscriptionResponse)
def cancel_subscription(
    request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> CancelSubscriptionResponse:
    subscription = subscription_service.cancel_subscription(db, current_user)
    record_audit_event(
        db,
        action="subscription_cancellation",
        user_id=current_user.id,
        resource_type="subscription",
        resource_id=str(subscription.id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    return CancelSubscriptionResponse(
        detail="Subscription will be cancelled at the end of the current billing period",
        cancel_at_period_end=subscription.cancel_at_period_end,
    )


@router.post("/reactivate", response_model=SubscriptionRead)
def reactivate_subscription(
    request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> SubscriptionRead:
    subscription = subscription_service.reactivate_subscription(db, current_user)
    record_audit_event(
        db,
        action="subscription_reactivation",
        user_id=current_user.id,
        resource_type="subscription",
        resource_id=str(subscription.id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    return subscription
