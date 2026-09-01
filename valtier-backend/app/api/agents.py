"""
Agent execution endpoint. Thin route -> AgentService -> Orchestrator ->
LangGraph -> Agents, per the layering rule: no agent logic here.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_client_ip, get_current_user
from app.models.user import User
from app.schemas.agent import AgentRunRequest, AgentRunResponse
from app.services import agent_service

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/run", response_model=AgentRunResponse, summary="Run the multi-agent orchestrator on a task")
def run_agent(
    payload: AgentRunRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentRunResponse:
    result = agent_service.run_agent_task(
        db,
        current_user,
        payload,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    return AgentRunResponse(**result)
