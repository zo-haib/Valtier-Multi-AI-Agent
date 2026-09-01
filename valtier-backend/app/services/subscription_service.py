"""
Subscription service: plan lookups, checkout session creation, and
cancel/reactivate flows. Webhook-driven state updates live in
`apply_webhook_event`, since Stripe webhooks are the source of truth
for subscription state — never the frontend.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError, NotFoundError
from app.models.payment import Payment, PaymentStatus
from app.models.subscription import BillingCycle, PlanType, Subscription, SubscriptionStatus
from app.models.user import User
from app.services import stripe_service
from app.services.plan_catalog import PLAN_CATALOG, price_id_to_plan
from app.utils.logging import get_logger

logger = get_logger("SUBSCRIPTION")

_STRIPE_STATUS_MAP = {
    "active": SubscriptionStatus.ACTIVE,
    "trialing": SubscriptionStatus.TRIALING,
    "past_due": SubscriptionStatus.PAST_DUE,
    "canceled": SubscriptionStatus.CANCELLED,
    "incomplete": SubscriptionStatus.INCOMPLETE,
    "incomplete_expired": SubscriptionStatus.EXPIRED,
    "unpaid": SubscriptionStatus.PAST_DUE,
}


def list_plans() -> list:
    return list(PLAN_CATALOG.values())


def get_subscription_for_user(db: Session, user: User) -> Subscription:
    subscription = db.scalar(select(Subscription).where(Subscription.user_id == user.id))
    if subscription is None:
        raise NotFoundError("No subscription found for this user")
    return subscription


def create_checkout_session(db: Session, user: User, price_id: str) -> str:
    plan_info = price_id_to_plan(price_id)
    if plan_info is None:
        raise AppError("Unrecognized price_id")

    subscription = get_subscription_for_user(db, user)
    customer_id = stripe_service.get_or_create_stripe_customer(user, subscription.stripe_customer_id)

    if subscription.stripe_customer_id != customer_id:
        subscription.stripe_customer_id = customer_id
        db.commit()

    return stripe_service.create_checkout_session(customer_id, price_id)


def cancel_subscription(db: Session, user: User) -> Subscription:
    subscription = get_subscription_for_user(db, user)
    if not subscription.stripe_subscription_id:
        raise AppError("No active paid subscription to cancel")

    stripe_service.cancel_subscription(subscription.stripe_subscription_id, at_period_end=True)
    subscription.cancel_at_period_end = True
    db.commit()
    db.refresh(subscription)
    return subscription


def reactivate_subscription(db: Session, user: User) -> Subscription:
    subscription = get_subscription_for_user(db, user)
    if not subscription.stripe_subscription_id:
        raise AppError("No paid subscription to reactivate")

    stripe_service.reactivate_subscription(subscription.stripe_subscription_id)
    subscription.cancel_at_period_end = False
    db.commit()
    db.refresh(subscription)
    return subscription


def _get_subscription_by_stripe_customer(db: Session, customer_id: str) -> Subscription | None:
    return db.scalar(select(Subscription).where(Subscription.stripe_customer_id == customer_id))


def _epoch_to_dt(epoch: int | None) -> datetime | None:
    return datetime.fromtimestamp(epoch, tz=timezone.utc) if epoch else None


def apply_webhook_event(db: Session, event: dict) -> None:
    """
    Update PostgreSQL subscription/payment records based on a verified
    Stripe webhook event. This is the ONLY path that changes
    subscription state from a paid plan — the frontend/checkout
    request never sets `status` or `plan` directly.
    """
    event_type = event["type"]
    data = event["data"]["object"]
    logger.info(f"Applying webhook event: {event_type}")

    if event_type == "checkout.session.completed":
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")
        subscription = _get_subscription_by_stripe_customer(db, customer_id)
        if subscription and subscription_id:
            subscription.stripe_subscription_id = subscription_id
            db.commit()

    elif event_type in ("customer.subscription.created", "customer.subscription.updated"):
        customer_id = data.get("customer")
        subscription = _get_subscription_by_stripe_customer(db, customer_id)
        if subscription is None:
            logger.warning(f"No local subscription found for Stripe customer {customer_id}")
            return

        items = data.get("items", {}).get("data", [])
        price_id = items[0]["price"]["id"] if items else None
        plan_info = price_id_to_plan(price_id) if price_id else None

        subscription.stripe_subscription_id = data.get("id")
        subscription.stripe_price_id = price_id
        if plan_info:
            subscription.plan, cycle = plan_info
            subscription.billing_cycle = BillingCycle.MONTHLY if cycle == "monthly" else BillingCycle.YEARLY

        subscription.status = _STRIPE_STATUS_MAP.get(data.get("status"), subscription.status)
        subscription.current_period_start = _epoch_to_dt(data.get("current_period_start"))
        subscription.current_period_end = _epoch_to_dt(data.get("current_period_end"))
        subscription.cancel_at_period_end = bool(data.get("cancel_at_period_end"))
        db.commit()

    elif event_type == "customer.subscription.deleted":
        customer_id = data.get("customer")
        subscription = _get_subscription_by_stripe_customer(db, customer_id)
        if subscription:
            subscription.status = SubscriptionStatus.CANCELLED
            subscription.plan = PlanType.FREE
            subscription.billing_cycle = BillingCycle.NONE
            db.commit()

    elif event_type in ("invoice.payment_succeeded", "invoice.payment_failed"):
        customer_id = data.get("customer")
        subscription = _get_subscription_by_stripe_customer(db, customer_id)
        if subscription is None:
            return
        payment = Payment(
            user_id=subscription.user_id,
            stripe_invoice_id=data.get("id"),
            stripe_payment_intent_id=data.get("payment_intent"),
            amount_cents=data.get("amount_paid") or data.get("amount_due") or 0,
            currency=data.get("currency", "usd"),
            status=PaymentStatus.SUCCEEDED if event_type == "invoice.payment_succeeded" else PaymentStatus.FAILED,
        )
        db.add(payment)
        if event_type == "invoice.payment_failed":
            subscription.status = SubscriptionStatus.PAST_DUE
        db.commit()

    else:
        logger.info(f"Unhandled webhook event type: {event_type}")
