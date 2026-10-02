"""Message model — one turn (user request or agent response) within a conversation."""
from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin

if TYPE_CHECKING:
    from app.models.conversation import Conversation


class MessageRole(str, enum.Enum):
    USER = "user"
    AGENT = "agent"


class Message(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[MessageRole] = mapped_column(SAEnum(MessageRole, name="message_role"))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    selected_agents: Mapped[list | None] = mapped_column(JSON, nullable=True)
    agent_result_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
