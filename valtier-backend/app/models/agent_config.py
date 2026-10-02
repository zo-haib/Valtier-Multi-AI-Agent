"""Per-agent admin configuration (model, temperature, etc.)."""
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AgentConfig(Base):
    __tablename__ = "agent_configs"

    agent_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    model: Mapped[str] = mapped_column(String(255), default="gemini-1.5-flash")
    temperature: Mapped[float] = mapped_column(Float, default=0.2)
    token_limit: Mapped[int] = mapped_column(Integer, default=8192)
    credit_cost: Mapped[int] = mapped_column(Integer, default=1)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(50), default="online")
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
