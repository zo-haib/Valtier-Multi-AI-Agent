"""Feature flags — globally toggle features without a code deploy."""
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
