"""Pydantic schemas for user data. Password/hashed_password never appear here."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import UserRole


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = None


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
