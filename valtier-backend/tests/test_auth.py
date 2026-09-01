"""Tests for signup, login, invalid password, duplicate email, protected endpoints."""
from __future__ import annotations


def test_signup_creates_user_and_returns_tokens(client, signup_user):
    email, tokens = signup_user(client)
    assert "access_token" in tokens
    assert "refresh_token" in tokens


def test_signup_duplicate_email_returns_409(client, signup_user):
    email, _ = signup_user(client)
    resp = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": "Password123", "full_name": "Someone Else"},
    )
    assert resp.status_code == 409


def test_login_success(client, signup_user):
    email, _ = signup_user(client, password="Password123")
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": "Password123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_invalid_password_returns_401(client, signup_user):
    email, _ = signup_user(client, password="Password123")
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": "WrongPassword1"})
    assert resp.status_code == 401


def test_protected_endpoint_requires_token(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_protected_endpoint_with_token_succeeds(client, auth_headers):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "hashed_password" not in body
    assert "password" not in body


def test_password_response_never_exposes_hash(client, auth_headers):
    resp = client.get("/api/v1/users/me", headers=auth_headers)
    assert resp.status_code == 200
    assert "hashed_password" not in resp.text
