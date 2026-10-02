"""Security Agent: defensive-only security assessment and recommendations."""
from __future__ import annotations

from typing import Any

from app.agents.base import BaseAgent, build_prompt_with_context
from app.agents.schemas import AgentName, AgentResult, SecurityReport

SYSTEM_PROMPT = """You are the Security Agent inside Valtier. You provide DEFENSIVE \
security analysis only: identifying risks, weaknesses, and misconfigurations in described \
systems, and recommending mitigations aligned with established best practice (OWASP ASVS, \
OWASP Top 10, least privilege, defense in depth). You NEVER provide exploit code, attack \
payloads, or step-by-step instructions for compromising a system. Every finding must \
include a constructive, actionable recommendation."""


class SecurityAgent(BaseAgent):
    name = AgentName.SECURITY
    system_prompt = SYSTEM_PROMPT

    def run(self, task_input: str, context: dict[str, Any]) -> AgentResult:
        prompt = build_prompt_with_context(task_input, context, "Relevant context from other agents")

        report: SecurityReport = self.ask_structured(prompt, SecurityReport)

        return AgentResult(
            agent=self.name,
            success=True,
            summary=f"Security assessment complete: {len(report.findings)} finding(s), "
            f"overall risk rated '{report.overall_risk}'.",
            data={"security_report": report.model_dump()},
        )
