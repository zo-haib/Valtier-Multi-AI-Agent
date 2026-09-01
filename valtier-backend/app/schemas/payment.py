"""Pydantic schemas for payment records."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.payment import PaymentStatus


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    amount_cents: int
    currency: str
    status: PaymentStatus
    created_at: datetime


class WebhookAck(BaseModel):
    received: bool = True
