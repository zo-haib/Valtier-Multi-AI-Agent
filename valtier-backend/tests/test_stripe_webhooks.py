"""
Tests for Stripe webhook signature validation and event handling.
Signature verification itself is mocked at the stripe.Webhook level
(the real cryptographic check is Stripe's own library code); the
important thing under test is that our endpoint enforces it and
updates subscription state only from verified events.
"""
from __future__ import annotations

from unittest.mock import patch

import pytest


def test_webhook_rejects_invalid_signature(client):
    resp = client.post(
        "/api/v1/payments/stripe/webhook",
        headers={"stripe-signature": "bad_signature"},
        json={"type": "checkout.session.completed", "data": {"object": {}}},
    )
    assert resp.status_code == 400


def test_webhook_updates_subscription_on_successful_payment(client, auth_headers, db_session):
    from app.models.subscription import Subscription
    from app.models.user import User

    user = db_session.query(User).first()
    subscription = db_session.query(Subscription).filter(Subscription.user_id == user.id).first()
    subscription.stripe_customer_id = "cus_test123"
    db_session.commit()

    event = {
        "type": "invoice.payment_succeeded",
        "data": {
            "object": {
                "id": "in_test123",
                "customer": "cus_test123",
                "amount_paid": 2900,
                "currency": "usd",
                "payment_intent": "pi_test123",
            }
        },
    }

    with patch("app.services.stripe_service.stripe.Webhook.construct_event", return_value=event):
        resp = client.post(
            "/api/v1/payments/stripe/webhook",
            headers={"stripe-signature": "valid_test_signature"},
            json={},
        )

    assert resp.status_code == 200

    from app.models.payment import Payment

    payment = db_session.query(Payment).filter(Payment.user_id == user.id).first()
    assert payment is not None
    assert payment.amount_cents == 2900


def test_webhook_cancellation_reverts_user_to_free_plan(client, auth_headers, db_session):
    from app.models.subscription import PlanType, Subscription
    from app.models.user import User

    user = db_session.query(User).first()
    subscription = db_session.query(Subscription).filter(Subscription.user_id == user.id).first()
    subscription.stripe_customer_id = "cus_test456"
    subscription.plan = PlanType.PRO
    db_session.commit()

    event = {
        "type": "customer.subscription.deleted",
        "data": {"object": {"customer": "cus_test456"}},
    }

    with patch("app.services.stripe_service.stripe.Webhook.construct_event", return_value=event):
        resp = client.post(
            "/api/v1/payments/stripe/webhook",
            headers={"stripe-signature": "valid_test_signature"},
            json={},
        )

    assert resp.status_code == 200
    db_session.refresh(subscription)
    assert subscription.plan == PlanType.FREE
