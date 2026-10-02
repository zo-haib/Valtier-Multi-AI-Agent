"""Tests for plan retrieval, checkout creation, and subscription status."""
from __future__ import annotations

from unittest.mock import patch


def test_list_plans_returns_free_pro_enterprise(client, auth_headers):
    resp = client.get("/api/v1/subscriptions/plans", headers=auth_headers)
    assert resp.status_code == 200
    plans = {p["plan"] for p in resp.json()}
    assert plans == {"free", "pro", "enterprise"}


def test_new_user_starts_on_free_plan(client, auth_headers):
    resp = client.get("/api/v1/subscriptions/me", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["plan"] == "free"
    assert body["status"] == "active"


def test_create_checkout_session_calls_stripe_and_returns_url(client, auth_headers, monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "stripe_pro_monthly_price_id", "price_pro_monthly_test")

    with patch("app.services.stripe_service.stripe.Customer.create", return_value={"id": "cus_test123"}):
        with patch(
            "app.services.stripe_service.stripe.checkout.Session.create",
            return_value={"url": "https://checkout.stripe.com/test-session"},
        ):
            resp = client.post(
                "/api/v1/subscriptions/create-checkout",
                headers=auth_headers,
                json={"price_id": "price_pro_monthly_test"},
            )

    assert resp.status_code == 200
    assert resp.json()["checkout_url"] == "https://checkout.stripe.com/test-session"


def test_create_checkout_rejects_unknown_price_id(client, auth_headers):
    resp = client.post(
        "/api/v1/subscriptions/create-checkout", headers=auth_headers, json={"price_id": "price_not_configured"}
    )
    assert resp.status_code == 400
