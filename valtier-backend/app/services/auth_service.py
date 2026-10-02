"""
Auth service: signup/login business logic. Routes call this instead of
touching the ORM or JWT machinery directly.
"""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    InvalidTokenError,
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.subscription import BillingCycle, PlanType, Subscription, SubscriptionStatus
from app.models.user import User


def signup(db: Session, email: str, password: str, full_name: str) -> User:
    existing = db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise ConflictError("An account with this email already exists")

    user = User(email=email, hashed_password=hash_password(password), full_name=full_name)
    db.add(user)
    db.flush()  # obtain user.id before creating the subscription

    # Every new user starts on the Free plan.
    subscription = Subscription(
        user_id=user.id, plan=PlanType.FREE, billing_cycle=BillingCycle.NONE, status=SubscriptionStatus.ACTIVE
    )
    db.add(subscription)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password")
    if not user.is_active:
        raise UnauthorizedError("This account has been deactivated")
    return user


def issue_tokens(user: User) -> tuple[str, str]:
    access_token = create_access_token(str(user.id), user.role.value)
    refresh_token = create_refresh_token(str(user.id))
    return access_token, refresh_token


def refresh_access_token(db: Session, refresh_token: str) -> str:
    try:
        payload = decode_token(refresh_token, expected_type=TokenType.REFRESH, db=db)
    except InvalidTokenError as exc:
        raise UnauthorizedError(str(exc)) from exc

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise UnauthorizedError("Invalid token subject") from exc

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError("User not found or inactive")

    return create_access_token(str(user.id), user.role.value)


def revoke_refresh_token(db: Session, refresh_token: str) -> None:
    try:
        payload = decode_token(refresh_token, expected_type=TokenType.REFRESH, db=None)
        jti = payload.get("jti")
        exp = payload.get("exp")
        if jti and exp:
            from datetime import datetime, timezone
            from app.models.token_blacklist import TokenBlacklist
            
            # check if already revoked
            existing = db.scalar(select(TokenBlacklist).where(TokenBlacklist.jti == jti))
            if not existing:
                blacklist_entry = TokenBlacklist(
                    jti=jti,
                    expires_at=datetime.fromtimestamp(exp, tz=timezone.utc)
                )
                db.add(blacklist_entry)
                db.commit()
    except InvalidTokenError:
        pass  # Token already invalid or expired, nothing to revoke

