"""Tests for plan-based usage limit enforcement before running an agent task."""
from __future__ import annotations

from unittest.mock import patch

from app.agents.schemas import AgentDecision, AgentName, AgentResult


def test_usage_limit_blocks_further_requests(client, auth_headers, db_session):
    from datetime import datetime, timezone

    from app.models.usage import UsageRecord
    from app.models.user import User

    user = db_session.query(User).first()
    period = datetime.now(timezone.utc).strftime("%Y-%m")
    db_session.add(UsageRecord(user_id=user.id, period=period, ai_requests_used=20, documents_used=0))
    db_session.commit()

    decision = AgentDecision(
        task_type="test", reasoning="stub", selected_agents=[AgentName.SALES],
        execution_order=[AgentName.SALES], requires_rag=False,
    )

    def fake_execute(self, task_input, context=None):
        return AgentResult(agent=self.name, success=True, summary="ok")

    with patch("app.agents.orchestrator.classify_request", return_value=decision):
        with patch("app.agents.base.BaseAgent.execute", fake_execute):
            resp = client.post("/api/v1/agents/run", headers=auth_headers, json={"task": "hello"})

    assert resp.status_code == 429
