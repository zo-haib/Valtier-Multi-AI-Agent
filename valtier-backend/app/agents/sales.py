"""Sales Agent: lead analysis, strategy, customer profiling, sales content generation."""
from __future__ import annotations

from typing import Any

from app.agents.base import BaseAgent, build_prompt_with_context
from app.agents.schemas import AgentName, AgentResult, SalesStrategy

SYSTEM_PROMPT = """You are the Sales Agent inside Valtier. Given information about leads, \
a market, or sales performance (including findings from the Data Processing or Analytics \
agents when available), produce a practical sales strategy: prioritized next actions and, \
when the request calls for it, a draft outreach email. Be concrete and avoid generic sales \
platitudes."""


class SalesAgent(BaseAgent):
    name = AgentName.SALES
    system_prompt = SYSTEM_PROMPT

    def run(self, task_input: str, context: dict[str, Any]) -> AgentResult:
        prompt = build_prompt_with_context(task_input, context, "Relevant findings from other agents")

        strategy: SalesStrategy = self.ask_structured(prompt, SalesStrategy)

        return AgentResult(
            agent=self.name,
            success=True,
            summary=f"Sales strategy generated with {len(strategy.prioritized_actions)} "
            f"prioritized action(s)." + (" Includes a draft email." if strategy.draft_email else ""),
            data={"sales_strategy": strategy.model_dump()},
        )
