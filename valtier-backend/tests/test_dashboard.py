"""Tests for the real dashboard summary endpoint (no hardcoded/fake stats)."""
from __future__ import annotations

from unittest.mock import patch

from app.agents.schemas import AgentDecision, AgentName, AgentResult


def test_dashboard_requires_authentication(client):
    resp = client.get("/api/v1/dashboard")
    assert resp.status_code == 401


def test_dashboard_returns_real_user_and_zeroed_stats_for_new_user(client, auth_headers, signup_user):
    resp = client.get("/api/v1/dashboard", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["user"]["email"]
    assert body["user"]["plan"] == "free"
    assert body["stats"]["agents"] == 6  # fixed roster size, not a guess
    assert body["stats"]["tasks"] == 0
    assert body["stats"]["hours_saved"] == 0


def test_dashboard_tasks_reflect_real_completed_agent_runs(client, auth_headers):
    decision = AgentDecision(
        task_type="test", reasoning="stub", selected_agents=[AgentName.SALES],
        execution_order=[AgentName.SALES], requires_rag=False,
    )

    def fake_execute(self, task_input, context=None):
        return AgentResult(agent=self.name, success=True, summary="ok")

    with patch("app.agents.orchestrator.classify_request", return_value=decision):
        with patch("app.agents.base.BaseAgent.execute", fake_execute):
            run_resp = client.post("/api/v1/agents/run", headers=auth_headers, json={"task": "hello"})
    assert run_resp.status_code == 200

    dash_resp = client.get("/api/v1/dashboard", headers=auth_headers)
    assert dash_resp.status_code == 200
    body = dash_resp.json()
    assert body["stats"]["tasks"] == 1
    assert body["stats"]["hours_saved"] == round(1 * 0.75, 1)
