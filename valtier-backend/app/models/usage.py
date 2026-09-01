"""
Usage records — one row per user per calendar month, incremented on
each AI request. Kept separate from Subscription so usage history is
preserved across plan changes.
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin

if TYPE_CHECKING:
    from app.models.user import User


class UsageRecord(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "usage_records"
    __table_args__ = (UniqueConstraint("user_id", "period", name="uq_usage_user_period"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    period: Mapped[str] = mapped_column(String(7), nullable=False)  # "YYYY-MM"
    ai_requests_used: Mapped[int] = mapped_column(Integer, default=0)
    documents_used: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship(back_populates="usage_records")
