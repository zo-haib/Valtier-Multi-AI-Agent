"""Tests for document upload, retrieval, deletion, and per-user isolation."""
from __future__ import annotations

import io
from unittest.mock import patch


def _upload_txt(client, headers, filename="notes.txt", content=b"hello world"):
    with patch("app.services.rag_service.ingest_document", return_value=3):
        return client.post(
            "/api/v1/documents/upload",
            headers=headers,
            files={"file": (filename, io.BytesIO(content), "text/plain")},
        )


def test_upload_document_succeeds(client, auth_headers):
    resp = _upload_txt(client, auth_headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "ready"
    assert body["chunk_count"] == 3


def test_upload_rejects_disallowed_extension(client, auth_headers):
    resp = client.post(
        "/api/v1/documents/upload",
        headers=auth_headers,
        files={"file": ("malware.exe", io.BytesIO(b"x"), "application/octet-stream")},
    )
    assert resp.status_code == 400


def test_list_documents_returns_own_documents(client, auth_headers):
    _upload_txt(client, auth_headers)
    resp = client.get("/api/v1/documents", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_delete_document_removes_it(client, auth_headers):
    upload_resp = _upload_txt(client, auth_headers)
    document_id = upload_resp.json()["id"]

    with patch("app.services.rag_service.delete_document_vectors"):
        delete_resp = client.delete(f"/api/v1/documents/{document_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    list_resp = client.get("/api/v1/documents", headers=auth_headers)
    assert list_resp.json() == []


def test_user_cannot_access_another_users_document(client, auth_headers, signup_user):
    upload_resp = _upload_txt(client, auth_headers)
    document_id = upload_resp.json()["id"]

    _, other_tokens = signup_user(client)
    other_headers = {"Authorization": f"Bearer {other_tokens['access_token']}"}

    resp = client.get(f"/api/v1/documents/{document_id}", headers=other_headers)
    assert resp.status_code == 403

    other_list = client.get("/api/v1/documents", headers=other_headers)
    assert other_list.json() == []
