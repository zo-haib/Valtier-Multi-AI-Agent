"""
Tests for the httpOnly-cookie auth migration: cookies are set on
signup/login, requests authenticate via cookie alone (no header),
logout clears them, and a request with neither cookie nor header is
rejected.

FastAPI's TestClient uses an httpx client with its own cookie jar, so
signup/login sets cookies on `client.cookies` automatically and
subsequent requests on the same `client` send them back — this
exercises the real Set-Cookie / Cookie round trip, not just the
Bearer-header fallback the other tests use.
"""
from __future__ import annotations


def test_signup_sets_httponly_cookies(client, signup_user):
    email, _ = signup_user(client)
    assert "valtier_access_token" in client.cookies
    assert "valtier_refresh_token" in client.cookies


def test_cookie_alone_authenticates_without_header(client, signup_user):
    signup_user(client)
    # No Authorization header at all — only the cookie jar from signup.
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 200


def test_no_cookie_no_header_is_rejected(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_logout_clears_cookies_and_revokes_access(client, signup_user):
    signup_user(client)
    assert client.get("/api/v1/auth/me").status_code == 200

    logout_resp = client.post("/api/v1/auth/logout")
    assert logout_resp.status_code == 200

    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_refresh_via_cookie_issues_new_access_token(client, signup_user):
    signup_user(client)
    resp = client.post("/api/v1/auth/refresh", json={})
    assert resp.status_code == 200
    assert "access_token" in resp.json()
