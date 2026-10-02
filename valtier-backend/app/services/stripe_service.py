"""
Stripe integration service. All actual calls to the Stripe API live
here — no fake/mocked payment logic. Requires `stripe` package and a
configured STRIPE_SECRET_KEY.
"""
from __future__ import annotations

from typing import Any

import stripe

from app.core.config import settings
from app.core.exceptions import AppError
from app.models.user import User
from app.utils.logging import get_logger

logger = get_logger("STRIPE")

stripe.api_key = settings.stripe_secret_key


def get_or_create_stripe_customer(user: User, existing_customer_id: str | None) -> str:
    if existing_customer_id:
        return existing_customer_id

    try:
        customer = stripe.Customer.create(
            email=user.email, name=user.full_name, metadata={"user_id": str(user.id)}
        )
    except stripe.error.StripeError as exc:
        logger.warning(f"Stripe customer creation failed: {exc}")
        raise AppError(f"Could not create billing customer: {exc.user_message or str(exc)}") from exc
    return customer["id"]


def create_checkout_session(customer_id: str, price_id: str) -> str:
    """Create a Stripe Checkout session and return its URL."""
    try:
        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{settings.frontend_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.frontend_url}/billing/cancelled",
        )
    except stripe.error.StripeError as exc:
        logger.warning(f"Stripe checkout session creation failed: {exc}")
        raise AppError(f"Could not create checkout session: {exc.user_message or str(exc)}") from exc

    if not session.get("url"):
        raise AppError("Stripe did not return a checkout URL")
    return session["url"]


def cancel_subscription(stripe_subscription_id: str, at_period_end: bool = True) -> dict[str, Any]:
    try:
        if at_period_end:
            return stripe.Subscription.modify(stripe_subscription_id, cancel_at_period_end=True)
        return stripe.Subscription.cancel(stripe_subscription_id)
    except stripe.error.StripeError as exc:
        logger.warning(f"Stripe subscription cancellation failed: {exc}")
        raise AppError(f"Could not cancel subscription: {exc.user_message or str(exc)}") from exc


def reactivate_subscription(stripe_subscription_id: str) -> dict[str, Any]:
    try:
        return stripe.Subscription.modify(stripe_subscription_id, cancel_at_period_end=False)
    except stripe.error.StripeError as exc:
        logger.warning(f"Stripe subscription reactivation failed: {exc}")
        raise AppError(f"Could not reactivate subscription: {exc.user_message or str(exc)}") from exc


def construct_webhook_event(payload: bytes, signature_header: str) -> stripe.Event:
    """Verify the webhook signature and return the parsed event. Never trust unverified payloads."""
    try:
        return stripe.Webhook.construct_event(payload, signature_header, settings.stripe_webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        logger.warning(f"Stripe webhook signature verification failed: {exc}")
        raise AppError("Invalid Stripe webhook signature") from exc
