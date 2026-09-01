"""Pydantic schemas for the agent-run and conversation/message endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class AgentRunRequest(BaseModel):
    task: str = Field(min_length=1, max_length=8000)
    conversation_id: Optional[uuid.UUID] = None
    document_id: Optional[uuid.UUID] = None


class AgentRunResponse(BaseModel):
    task_id: uuid.UUID
    conversation_id: uuid.UUID
    selected_agents: list[str]
    status: str
    result: str
    agent_results: list[dict[str, Any]] = Field(default_factory=list)


class ConversationCreate(BaseModel):
    title: Optional[str] = None


class ConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: Optional[str]
    created_at: datetime
    updated_at: datetime


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: str
    content: str
    selected_agents: Optional[list[str]] = None
    # Structured per-agent output (security findings, requirements, project
    # plans, sales strategy, etc.) captured at execution time — see
    # agent_service.run_agent_task. Exposed so the frontend can render real
    # data (Security Center, Requirements Workspace, Sales Intelligence)
    # instead of falling back to mock data.
    agent_result_data: Optional[dict] = None
    created_at: datetime


class ConversationDetailRead(ConversationRead):
    messages: list[MessageRead] = Field(default_factory=list)


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=8000)
