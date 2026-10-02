"""Task model — item within a Project, optionally assigned to an AI agent."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum as SAEnum, ForeignKey, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin

if TYPE_CHECKING:
    from app.models.project import Project


class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    BLOCKED = "blocked"


class Task(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "tasks"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(SAEnum(TaskStatus, name="task_status"), default=TaskStatus.TODO)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    assigned_agent_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    milestone: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    project: Mapped["Project"] = relationship(back_populates="tasks")
