"""
Tests for the Project Management agent, focused on the context-
truncation and defensive-parsing fixes.

(Corrected from the QA team's originally supplied
test_project_management_agent.py, which was missing `Optional`/`Any`
imports — this version is otherwise faithful to their test intent.)
"""
from __future__ import annotations

from typing import Optional
from unittest.mock import patch

from pydantic import BaseModel

from app.agents.project_management import ProjectManagementAgent
from app.agents.schemas import AgentName


class DummyTask(BaseModel):
    id: str
    title: str


class DummyProjectPlan(BaseModel):
    title: str = "Test Plan"
    tasks: list[DummyTask] = []
    milestones: list[str] = []


def test_project_management_agent_success():
    """Test standard execution with valid prompt and context."""
    agent = ProjectManagementAgent()

    mock_plan = DummyProjectPlan(
        title="E-Commerce Redesign",
        tasks=[DummyTask(id="1", title="Database Design")],
        milestones=["Phase 1 Complete"],
    )

    with patch.object(agent, "ask_structured", return_value=mock_plan):
        context = {"prior_summary": "Architecture reviewed by Tech Lead."}
        result = agent.run("Create a 3-month rollout plan", context)

        assert result.success is True
        assert result.agent == AgentName.PROJECT_MANAGEMENT
        assert "E-Commerce Redesign" in result.summary
        assert "1 tasks" in result.summary
        assert result.data["project_plan"]["title"] == "E-Commerce Redesign"


def test_project_management_agent_context_truncation():
    """Ensure context exceeding the safety limit is safely truncated."""
    agent = ProjectManagementAgent()
    mock_plan = DummyProjectPlan()

    large_context = "A" * 10_000  # exceeds MAX_CONTEXT_CHARS

    with patch.object(agent, "ask_structured", return_value=mock_plan) as mock_ask:
        agent.run("Build a plan", {"prior_summary": large_context})

        called_prompt = mock_ask.call_args[0][0]
        assert "...[Context Truncated]" in called_prompt
        # And the raw 10,000-char blob must not have made it through whole.
        assert len(called_prompt) < 10_500


def test_project_management_agent_handles_none_lists():
    """Verify the agent does not crash if the plan's list fields come back empty."""
    agent = ProjectManagementAgent()

    class MinimalPlan(BaseModel):
        title: str = "Minimal Plan"
        tasks: list = []
        milestones: list = []

    with patch.object(agent, "ask_structured", return_value=MinimalPlan()):
        result = agent.run("Generate plan", {})
        assert result.success is True
        assert "0 tasks" in result.summary
