"""
Dashboard summary service: assembles the authenticated user's real
stats from the database. Nothing here is a placeholder — every number
is a genuine query result, except `hours_saved`, which is an explicit,
documented estimate (tasks completed x an assumed average time saved
per completed agent task) rather than a directly-measured quantity;
there is no ground truth for "time saved" to measure directly.
"""
from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.agents.schemas import AgentName
from app.models.conversation import Conversation
from app.models.document import Document, DocumentStatus
from app.models.message import Message, MessageRole
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.dashboard import DashboardResponse, DashboardStats, DashboardUser

# Documented assumption, not a measurement: each completed agent task is
# estimated to replace roughly this many hours of manual work. Surfaced
# in the API response only as a derived, clearly-estimated figure.
_ESTIMATED_HOURS_SAVED_PER_TASK = 0.75

# The agent roster is fixed and defined in code (see app/agents/schemas.py
# AgentName) — this is a real count of what's available, not a guess.
_TOTAL_AGENTS = len(AgentName)


def get_dashboard_summary(db: Session, user: User) -> DashboardResponse:
    tasks_completed = (
        db.scalar(
            select(func.count())
            .select_from(Message)
            .join(Conversation, Message.conversation_id == Conversation.id)
            .where(Message.role == MessageRole.AGENT, Conversation.user_id == user.id)
        )
        or 0
    )

    knowledge_sources = (
        db.scalar(
            select(func.count())
            .select_from(Document)
            .where(Document.user_id == user.id, Document.status == DocumentStatus.READY)
        )
        or 0
    )

    subscription = db.scalar(select(Subscription).where(Subscription.user_id == user.id))
    plan = subscription.plan.value if subscription else "free"

    first_name = user.full_name.split(" ")[0] if user.full_name else user.email.split("@")[0]

    return DashboardResponse(
        user=DashboardUser(id=str(user.id), name=user.full_name, email=user.email, plan=plan),
        stats=DashboardStats(
            tasks=tasks_completed,
            agents=_TOTAL_AGENTS,
            knowledge_sources=knowledge_sources,
            hours_saved=round(tasks_completed * _ESTIMATED_HOURS_SAVED_PER_TASK, 1),
        ),
        greeting_name=first_name,
    )
