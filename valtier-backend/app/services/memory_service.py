"""Memory service: thin wrapper around MemoryManager used by the API layer."""
from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.memory.memory_manager import MemoryManager
from app.models.memory import MemoryEntry
from app.schemas.document import MemoryEntryCreate


def create_memory(db: Session, user_id: uuid.UUID, payload: MemoryEntryCreate) -> MemoryEntry:
    manager = MemoryManager(db)
    return manager.remember(user_id, payload.category, payload.key, payload.value)


def list_memories(db: Session, user_id: uuid.UUID) -> list[MemoryEntry]:
    return MemoryManager(db).list_for_user(user_id)


def delete_memory(db: Session, user_id: uuid.UUID, memory_id: uuid.UUID) -> None:
    deleted = MemoryManager(db).delete(user_id, memory_id)
    if not deleted:
        raise NotFoundError("Memory entry not found")
