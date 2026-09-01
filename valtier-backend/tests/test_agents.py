"""
Tests for the agent execution endpoint and routing. The orchestrator's
LLM calls are stubbed so tests run without a live GOOGLE_API_KEY.
"""
from __future__ import annotations

from unittest.mock import patch

from app.agents.schemas import AgentDecision, AgentName, AgentResult


def _fake_decision(agents: list[AgentName]) -> AgentDecision:
    return AgentDecision(
        task_type="test_task",
        reasoning="stubbed for tests",
        selected_agents=agents,
        execution_order=agents,
        requires_rag=False,
    )


def test_agent_run_executes_selected_agents(client, auth_headers):
    decision = _fake_decision([AgentName.SALES])

    def fake_execute(self, task_input, context=None):
        return AgentResult(agent=self.name, success=True, summary=f"{self.name.value} stub ran")

    with patch("app.agents.orchestrator.classify_request", return_value=decision):
        with patch("app.agents.base.BaseAgent.execute", fake_execute):
            resp = client.post(
                "/api/v1/agents/run", headers=auth_headers, json={"task": "Draft a sales email"}
            )

    assert resp.status_code == 200
    body = resp.json()
    assert body["selected_agents"] == ["sales"]
    assert body["status"] == "completed"
    assert "conversation_id" in body


def test_agent_run_selects_only_needed_agents_not_all_six(client, auth_headers):
    decision = _fake_decision([AgentName.SECURITY])

    def fake_execute(self, task_input, context=None):
        return AgentResult(agent=self.name, success=True, summary="ok")

    with patch("app.agents.orchestrator.classify_request", return_value=decision):
        with patch("app.agents.base.BaseAgent.execute", fake_execute):
            resp = client.post(
                "/api/v1/agents/run",
                headers=auth_headers,
                json={"task": "Review this app for security issues"},
            )

    assert resp.status_code == 200
    assert resp.json()["selected_agents"] == ["security"]


def test_agent_run_reports_agent_failure_without_crashing(client, auth_headers):
    decision = _fake_decision([AgentName.ANALYTICS])

    def failing_execute(self, task_input, context=None):
        return AgentResult(
            agent=self.name,
            success=False,
            summary="analytics agent failed: boom",
            errors=[],
        )

    with patch("app.agents.orchestrator.classify_request", return_value=decision):
        with patch("app.agents.base.BaseAgent.execute", failing_execute):
            resp = client.post(
                "/api/v1/agents/run", headers=auth_headers, json={"task": "Analyze this data"}
            )

    assert resp.status_code == 200
    assert "analytics" in resp.json()["selected_agents"]


def test_agent_run_requires_authentication(client):
    resp = client.post("/api/v1/agents/run", json={"task": "Do something"})
    assert resp.status_code == 401


def test_agent_run_rejects_empty_task(client, auth_headers):
    resp = client.post("/api/v1/agents/run", headers=auth_headers, json={"task": ""})
    assert resp.status_code == 422
