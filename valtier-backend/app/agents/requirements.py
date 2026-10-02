"""Requirements Agent: functional/non-functional requirements, user stories, acceptance criteria."""
from __future__ import annotations

from typing import Any

from app.agents.base import BaseAgent, build_prompt_with_context
from app.agents.schemas import AgentName, AgentResult, RequirementsSpec

SYSTEM_PROMPT = """You are the Requirements Agent inside Valtier. Given a business or \
product description, extract a clear, structured specification: functional requirements, \
non-functional requirements, user stories in "As a <role>, I want <goal>, so that <benefit>" \
form with acceptance criteria, and any ambiguities you notice. Avoid inventing requirements \
not reasonably implied by the request."""


class RequirementsAgent(BaseAgent):
    name = AgentName.REQUIREMENTS
    system_prompt = SYSTEM_PROMPT

    def run(self, task_input: str, context: dict[str, Any]) -> AgentResult:
        prompt = build_prompt_with_context(task_input, context, "Relevant context from other agents")

        spec: RequirementsSpec = self.ask_structured(prompt, RequirementsSpec)

        return AgentResult(
            agent=self.name,
            success=True,
            summary=f"Extracted {len(spec.functional_requirements)} functional and "
            f"{len(spec.non_functional_requirements)} non-functional requirements, "
            f"{len(spec.user_stories)} user stories.",
            data={"requirements_spec": spec.model_dump()},
        )
