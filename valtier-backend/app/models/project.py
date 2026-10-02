"""Project model — user-owned project with tasks and agent assignments."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional, List

from sqlalchemy import Enum as SAEnum, ForeignKey, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin

if TYPE_CHECKING:
    from app.models.task import Task
    from app.models.user import User


class ProjectStatus(str, enum.Enum):
    ON_TRACK = "on_track"
    AT_RISK = "at_risk"
    COMPLETED = "completed"
    PAUSED = "paused"


class Project(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(SAEnum(ProjectStatus, name="project_status"), default=ProjectStatus.ON_TRACK)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    tasks: Mapped[List["Task"]] = relationship(back_populates="project", cascade="all, delete-orphan", lazy="selectin")
    user: Mapped["User"] = relationship(back_populates="projects")
