"""
Authentication endpoints: signup, login, refresh, me, logout.

Tokens are set as httpOnly cookies (see app/core/security.py) so
client-side JavaScript can never read them — mitigating token theft
via XSS. They are also still returned in the JSON body for non-browser
API clients (mobile apps, server-to-server callers) that can't rely on
cookies; the web frontend ignores that body and relies on the cookie.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_client_ip, get_current_user
from app.core.security import (
    REFRESH_TOKEN_COOKIE,
    clear_auth_cookies,
    set_access_cookie,
    set_auth_cookies,
)
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    SignupRequest,
    TokenResponse,
)
from app.schemas.user import UserRead
from app.services import auth_service
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    user = auth_service.signup(db, payload.email, payload.password, payload.full_name)
    access_token, refresh_token = auth_service.issue_tokens(user)
    set_auth_cookies(response, access_token, refresh_token)

    record_audit_event(
        db,
        action="user_signup",
        user_id=user.id,
        resource_type="user",
        resource_id=str(user.id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    user = auth_service.authenticate(db, payload.email, payload.password)
    access_token, refresh_token = auth_service.issue_tokens(user)
    set_auth_cookies(response, access_token, refresh_token)

    record_audit_event(
        db,
        action="user_login",
        user_id=user.id,
        resource_type="user",
        resource_id=str(user.id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(
    payload: RefreshRequest, request: Request, response: Response, db: Session = Depends(get_db)
) -> AccessTokenResponse:
    # Prefer the httpOnly cookie (browser flow); fall back to the request
    # body for non-browser API clients that can't rely on cookies.
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE) or payload.refresh_token
    if not refresh_token:
        from app.core.exceptions import UnauthorizedError

        raise UnauthorizedError("No refresh token provided")

    access_token = auth_service.refresh_access_token(db, refresh_token)
    set_access_cookie(response, access_token)
    return AccessTokenResponse(access_token=access_token)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    clear_auth_cookies(response)
    record_audit_event(
        db,
        action="user_logout",
        user_id=current_user.id,
        resource_type="user",
        resource_id=str(current_user.id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    return MessageResponse(detail="Logged out successfully")
