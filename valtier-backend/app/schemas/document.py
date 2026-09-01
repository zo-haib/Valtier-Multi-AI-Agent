"""Pydantic schemas for document upload/management endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.document import DocumentStatus


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    filename: str
    file_type: str
    file_size: int
    status: DocumentStatus
    chunk_count: int
    error_message: Optional[str]
    created_at: datetime


class MemoryEntryCreate(BaseModel):
    category: str = "general"
    key: str
    value: str


class MemoryEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: str
    key: str
    value: str
    created_at: datetime
