"""Analytics Agent: trends, patterns, comparisons, and structured insight reports."""
from __future__ import annotations

from typing import Any

from app.agents.base import BaseAgent, build_prompt_with_context
from app.agents.schemas import AgentName, AgentResult, AnalyticsReport

SYSTEM_PROMPT = """You are the Analytics Agent inside Valtier. You identify trends, \
patterns, and comparisons in data, and explain findings clearly and concisely. When prior \
agents (e.g. Data Processing) have supplied a dataset profile, ground your insights in it \
rather than inventing numbers."""


class AnalyticsAgent(BaseAgent):
    name = AgentName.ANALYTICS
    system_prompt = SYSTEM_PROMPT

    def run(self, task_input: str, context: dict[str, Any]) -> AgentResult:
        prompt = build_prompt_with_context(task_input, context, "Relevant prior findings from other agents")

        report: AnalyticsReport = self.ask_structured(prompt, AnalyticsReport)

        return AgentResult(
            agent=self.name,
            success=True,
            summary=f"Analytics complete: {len(report.insights)} insight(s), "
            f"{len(report.trends)} trend(s) identified.",
            data={"analytics_report": report.model_dump()},
        )
