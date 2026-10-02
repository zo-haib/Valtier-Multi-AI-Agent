"""Long-term memory entries, isolated per user."""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin

if TYPE_CHECKING:
    from app.models.user import User


class MemoryEntry(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "memories"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="general")
    key: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped["User"] = relationship(back_populates="memories")
