"""
Agent service: the layer between the /agents API route and the
LangGraph orchestrator. Implements the required flow:

    Request -> Authenticate (handled by route dependency)
            -> Check subscription
            -> Check usage
            -> Run Agent Orchestrator
            -> Save conversation/messages
            -> Increment usage
            -> Create audit log

No agent logic lives in the API route itself.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents.orchestrator import run_orchestrator
from app.core.exceptions import NotFoundError, SubscriptionRequiredError, UsageLimitExceededError
from app.models.conversation import Conversation
from app.models.message import Message, MessageRole
from app.models.subscription import PlanType, Subscription
from app.models.usage import UsageRecord
from app.models.user import User
from app.schemas.agent import AgentRunRequest
from app.services.audit_service import record_audit_event
from app.services.plan_catalog import PLAN_CATALOG
from app.utils.logging import get_logger

logger = get_logger("AGENT SERVICE")


def _current_period() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


def _get_or_create_usage_record(db: Session, user_id: uuid.UUID) -> UsageRecord:
    period = _current_period()
    record = db.scalar(
        select(UsageRecord).where(UsageRecord.user_id == user_id, UsageRecord.period == period)
    )
    if record is None:
        record = UsageRecord(user_id=user_id, period=period, ai_requests_used=0, documents_used=0)
        db.add(record)
        db.commit()
        db.refresh(record)
    return record


def _get_subscription(db: Session, user: User) -> Subscription:
    subscription = db.scalar(select(Subscription).where(Subscription.user_id == user.id))
    if subscription is None:
        raise SubscriptionRequiredError("No active subscription found for this account")
    return subscription


def check_and_reserve_usage(db: Session, user: User) -> tuple[Subscription, UsageRecord]:
    """Check subscription + usage limits, raising if the user is over quota."""
    subscription = _get_subscription(db, user)
    plan_features = PLAN_CATALOG[subscription.plan]

    usage = _get_or_create_usage_record(db, user.id)
    if usage.ai_requests_used >= plan_features.ai_requests_per_month:
        raise UsageLimitExceededError(
            f"Monthly AI request limit reached for the {subscription.plan.value} plan "
            f"({plan_features.ai_requests_per_month} requests). Upgrade your plan to continue."
        )
    return subscription, usage


def _get_or_create_conversation(db: Session, user_id: uuid.UUID, conversation_id: uuid.UUID | None) -> Conversation:
    if conversation_id is not None:
        conversation = db.get(Conversation, conversation_id)
        if conversation is None or conversation.user_id != user_id:
            raise NotFoundError("Conversation not found")
        return conversation

    conversation = Conversation(user_id=user_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def run_agent_task(
    db: Session,
    user: User,
    payload: AgentRunRequest,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> dict:
    subscription, usage = check_and_reserve_usage(db, user)

    csv_path = None
    if payload.document_id is not None:
        from app.services.rag_service import get_document

        document = get_document(db, user.id, payload.document_id)
        if document.file_type == "csv":
            csv_path = document.storage_path

    conversation = _get_or_create_conversation(db, user.id, payload.conversation_id)

    user_message = Message(conversation_id=conversation.id, role=MessageRole.USER, content=payload.task)
    db.add(user_message)
    db.commit()

    result = run_orchestrator(payload.task, user_id=str(user.id), csv_path=csv_path)

    agent_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.AGENT,
        content=result["summary"],
        selected_agents=[a.value for a in result["selected_agents"]],
        agent_result_data={"results": [r.model_dump() for r in result["agent_results"]]},
    )
    db.add(agent_message)

    usage.ai_requests_used += 1
    db.add(usage)
    db.commit()
    db.refresh(agent_message)

    record_audit_event(
        db,
        action="agent_execution",
        user_id=user.id,
        resource_type="conversation",
        resource_id=str(conversation.id),
        ip_address=ip_address,
        user_agent=user_agent,
        metadata={"selected_agents": [a.value for a in result["selected_agents"]], "task_type": result["task_type"]},
    )

    return {
        "task_id": agent_message.id,
        "conversation_id": conversation.id,
        "selected_agents": [a.value for a in result["selected_agents"]],
        "status": "completed" if not result["errors"] else "completed_with_errors",
        "result": result["summary"],
        "agent_results": [r.model_dump() for r in result["agent_results"]],
    }
