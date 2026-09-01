"""Tests for role-based access control on admin endpoints."""
from __future__ import annotations


def test_regular_user_forbidden_from_admin_dashboard(client, auth_headers):
    resp = client.get("/api/v1/admin/dashboard", headers=auth_headers)
    assert resp.status_code == 403


def test_regular_user_forbidden_from_admin_users_list(client, auth_headers):
    resp = client.get("/api/v1/admin/users", headers=auth_headers)
    assert resp.status_code == 403


def test_admin_can_access_admin_dashboard(client, admin_headers):
    resp = client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total_users" in body


def test_admin_can_list_users(client, admin_headers):
    resp = client.get("/api/v1/admin/users", headers=admin_headers)
    assert resp.status_code == 200
    assert "items" in resp.json()


def test_admin_user_list_includes_plan(client, admin_headers):
    resp = client.get("/api/v1/admin/users", headers=admin_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) >= 1
    for item in items:
        assert item["plan"] in {"free", "pro", "enterprise"}


def test_admin_can_list_subscriptions_with_customer_info(client, admin_headers):
    resp = client.get("/api/v1/admin/subscriptions", headers=admin_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) >= 1
    for item in items:
        assert "user_email" in item
        assert "user_id" in item
        assert item["plan"] in {"free", "pro", "enterprise"}
