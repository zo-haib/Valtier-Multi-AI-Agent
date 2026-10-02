"""Pydantic schemas for authentication endpoints."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if not any(c.isdigit() for c in value):
            raise ValueError("Password must contain at least one digit")
        if not any(c.isalpha() for c in value):
            raise ValueError("Password must contain at least one letter")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    # Optional: the browser flow relies on the httpOnly refresh_token
    # cookie instead. Non-browser API clients that can't rely on cookies
    # (mobile apps, server-to-server, Postman) may still pass it explicitly.
    refresh_token: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    detail: str
