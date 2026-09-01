"""
Stripe webhook endpoint. This is the ONLY place subscription state is
updated for paid plans — the frontend/checkout flow never sets status
directly. Signature verification happens before the payload is trusted.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.payment import WebhookAck
from app.services import stripe_service, subscription_service

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/stripe/webhook", response_model=WebhookAck)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(default="", alias="stripe-signature"),
    db: Session = Depends(get_db),
) -> WebhookAck:
    payload = await request.body()
    event = stripe_service.construct_webhook_event(payload, stripe_signature)
    subscription_service.apply_webhook_event(db, event)
    return WebhookAck(received=True)
