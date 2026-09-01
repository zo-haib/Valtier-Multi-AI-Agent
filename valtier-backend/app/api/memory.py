"""
Long-term memory endpoints. Memory is isolated by user — User A must
never retrieve User B's memory (enforced in MemoryManager via user_id
scoping on every query).
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.document import MemoryEntryCreate, MemoryEntryRead
from app.services import memory_service

router = APIRouter(prefix="/memory", tags=["memory"])


@router.post("", response_model=MemoryEntryRead, status_code=status.HTTP_201_CREATED)
def create_memory(
    payload: MemoryEntryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> MemoryEntryRead:
    return memory_service.create_memory(db, current_user.id, payload)


@router.get("", response_model=list[MemoryEntryRead])
def list_memory(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[MemoryEntryRead]:
    return memory_service.list_memories(db, current_user.id)


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memory(
    memory_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> None:
    memory_service.delete_memory(db, current_user.id, memory_id)
