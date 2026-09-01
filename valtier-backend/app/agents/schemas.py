"""
Structured output models for the six specialized agents. Mirrors the
standalone Valtier agentic core so behavior stays consistent between
the CLI core and this backend's in-process orchestrator.
"""
from __future__ import annotations

import uuid
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


class AgentName(str, Enum):
    PROJECT_MANAGEMENT = "project_management"
    DATA_PROCESSING = "data_processing"
    SECURITY = "security"
    ANALYTICS = "analytics"
    REQUIREMENTS = "requirements"
    SALES = "sales"


class AgentDecision(BaseModel):
    task_type: str
    reasoning: str
    selected_agents: list[AgentName] = Field(default_factory=list)
    requires_rag: bool = False
    execution_order: list[AgentName] = Field(default_factory=list)


class AgentError(BaseModel):
    agent: str
    message: str


class AgentResult(BaseModel):
    agent: AgentName
    success: bool
    summary: str
    data: dict[str, Any] = Field(default_factory=dict)
    errors: list[AgentError] = Field(default_factory=list)


# --- Project Management ---

class Task(BaseModel):
    id: str = Field(default_factory=_new_id)
    title: str
    description: str = ""
    estimated_days: Optional[float] = None
    dependencies: list[str] = Field(default_factory=list)
    priority: str = "medium"


class Milestone(BaseModel):
    id: str = Field(default_factory=_new_id)
    title: str
    task_ids: list[str] = Field(default_factory=list)


class ProjectPlan(BaseModel):
    title: str
    summary: str
    tasks: list[Task] = Field(default_factory=list)
    milestones: list[Milestone] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)


# --- Data Processing ---

class ColumnProfile(BaseModel):
    name: str
    dtype: str
    missing_count: int = 0
    missing_pct: float = 0.0


class DataProfile(BaseModel):
    source: str
    row_count: int
    column_count: int
    columns: list[ColumnProfile] = Field(default_factory=list)
    issues: list[str] = Field(default_factory=list)


# --- Security ---

class SecurityFinding(BaseModel):
    id: str = Field(default_factory=_new_id)
    title: str
    severity: str
    category: str
    description: str
    recommendation: str


class SecurityReport(BaseModel):
    summary: str
    findings: list[SecurityFinding] = Field(default_factory=list)
    overall_risk: str = "medium"


# --- Analytics ---

class Insight(BaseModel):
    title: str
    detail: str
    confidence: str = "medium"


class AnalyticsReport(BaseModel):
    summary: str
    insights: list[Insight] = Field(default_factory=list)
    trends: list[str] = Field(default_factory=list)


# --- Requirements ---

class Requirement(BaseModel):
    id: str = Field(default_factory=_new_id)
    text: str
    type: str
    priority: str = "medium"


class UserStory(BaseModel):
    id: str = Field(default_factory=_new_id)
    role: str
    goal: str
    benefit: str
    acceptance_criteria: list[str] = Field(default_factory=list)


class RequirementsSpec(BaseModel):
    title: str
    functional_requirements: list[Requirement] = Field(default_factory=list)
    non_functional_requirements: list[Requirement] = Field(default_factory=list)
    user_stories: list[UserStory] = Field(default_factory=list)
    ambiguities: list[str] = Field(default_factory=list)


# --- Sales ---

class SalesStrategy(BaseModel):
    summary: str
    prioritized_actions: list[str] = Field(default_factory=list)
    draft_email: Optional[str] = None
