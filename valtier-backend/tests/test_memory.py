"""Tests for memory create/retrieve and per-user isolation."""
from __future__ import annotations


def test_create_and_list_memory(client, auth_headers):
    resp = client.post(
        "/api/v1/memory",
        headers=auth_headers,
        json={"category": "preferences", "key": "tone", "value": "concise"},
    )
    assert resp.status_code == 201

    list_resp = client.get("/api/v1/memory", headers=auth_headers)
    assert list_resp.status_code == 200
    entries = list_resp.json()
    assert len(entries) == 1
    assert entries[0]["key"] == "tone"


def test_memory_isolated_between_users(client, auth_headers, signup_user):
    client.post(
        "/api/v1/memory", headers=auth_headers, json={"category": "general", "key": "secret", "value": "abc"}
    )

    _, other_tokens = signup_user(client)
    other_headers = {"Authorization": f"Bearer {other_tokens['access_token']}"}

    resp = client.get("/api/v1/memory", headers=other_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_delete_memory(client, auth_headers):
    create_resp = client.post(
        "/api/v1/memory", headers=auth_headers, json={"category": "general", "key": "k", "value": "v"}
    )
    memory_id = create_resp.json()["id"]

    delete_resp = client.delete(f"/api/v1/memory/{memory_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    list_resp = client.get("/api/v1/memory", headers=auth_headers)
    assert list_resp.json() == []


def test_user_cannot_delete_another_users_memory(client, auth_headers, signup_user):
    create_resp = client.post(
        "/api/v1/memory", headers=auth_headers, json={"category": "general", "key": "k", "value": "v"}
    )
    memory_id = create_resp.json()["id"]

    _, other_tokens = signup_user(client)
    other_headers = {"Authorization": f"Bearer {other_tokens['access_token']}"}

    resp = client.delete(f"/api/v1/memory/{memory_id}", headers=other_headers)
    assert resp.status_code == 404
