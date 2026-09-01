"""Tests for the health check endpoints."""
from __future__ import annotations


def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "healthy", "service": "valtier-backend"}


def test_deep_health_check_reports_database(client):
    resp = client.get("/health/deep")
    assert resp.status_code == 200
    body = resp.json()
    assert body["database"] == "connected"
