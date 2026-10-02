"""Projects API — persistence and ownership."""
from __future__ import annotations


def test_projects_crud(client, auth_headers):
    create = client.post(
        "/api/v1/projects",
        headers=auth_headers,
        json={"name": "Q4 Initiative", "description": "Test project"},
    )
    assert create.status_code == 201, create.text
    project_id = create.json()["id"]

    listed = client.get("/api/v1/projects", headers=auth_headers)
    assert listed.status_code == 200
    assert any(p["id"] == project_id for p in listed.json())

    task = client.post(
        f"/api/v1/projects/{project_id}/tasks",
        headers=auth_headers,
        json={"title": "Draft plan"},
    )
    assert task.status_code == 201, task.text

    detail = client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert detail.status_code == 200
    assert len(detail.json()["tasks"]) == 1

    delete = client.delete(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert delete.status_code == 204
