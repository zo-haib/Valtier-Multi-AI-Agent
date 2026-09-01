"""Project Management Agent: plans, tasks, milestones, timelines, dependencies."""
from __future__ import annotations

from typing import Any

from app.agents.base import BaseAgent, build_prompt_with_context
from app.agents.schemas import AgentName, AgentResult, ProjectPlan

SYSTEM_PROMPT = """You are the Project Management Agent inside Valtier. Given a project \
description (optionally including prior findings from other agents), produce a realistic, \
well-structured project plan: concrete tasks with sensible dependencies and priorities, \
grouped into milestones, with estimated durations and realistic risks. Be specific to the \
domain described — avoid generic filler tasks."""


class ProjectManagementAgent(BaseAgent):
    name = AgentName.PROJECT_MANAGEMENT
    system_prompt = SYSTEM_PROMPT

    def run(self, task_input: str, context: dict[str, Any]) -> AgentResult:
        prompt = build_prompt_with_context(task_input, context, "Relevant prior findings from other agents")

        plan: ProjectPlan = self.ask_structured(prompt, ProjectPlan)

        return AgentResult(
            agent=self.name,
            success=True,
            summary=f"Generated project plan '{plan.title}' with {len(plan.tasks)} tasks "
            f"and {len(plan.milestones)} milestones.",
            data={"project_plan": plan.model_dump()},
        )
