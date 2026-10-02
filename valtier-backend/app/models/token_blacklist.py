"""Token blacklist — revoked refresh token JTIs stored server-side."""
from __future__ import annotations
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class TokenBlacklist(Base):
    __tablename__ = "token_blacklists"

    jti: Mapped[str] = mapped_column(String(64), primary_key=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
