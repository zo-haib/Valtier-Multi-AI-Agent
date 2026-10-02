"""
Long-term memory manager. Backed by the `memories` PostgreSQL table via
SQLAlchemy, so every operation is scoped to a single user — one user's
memory must never be visible to, or overwritten by, another.
"""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.memory import MemoryEntry


class MemoryManager:
    def __init__(self, db: Session) -> None:
        self.db = db

    def remember(self, user_id: uuid.UUID, category: str, key: str, value: str) -> MemoryEntry:
        """Create or update a memory entry for this user under (category, key)."""
        existing = self.db.scalar(
            select(MemoryEntry).where(
                MemoryEntry.user_id == user_id,
                MemoryEntry.category == category,
                MemoryEntry.key == key,
            )
        )
        if existing:
            existing.value = value
            self.db.commit()
            self.db.refresh(existing)
            return existing

        entry = MemoryEntry(user_id=user_id, category=category, key=key, value=value)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def list_for_user(self, user_id: uuid.UUID) -> list[MemoryEntry]:
        return list(
            self.db.scalars(
                select(MemoryEntry).where(MemoryEntry.user_id == user_id).order_by(MemoryEntry.created_at.desc())
            )
        )

    def get(self, user_id: uuid.UUID, memory_id: uuid.UUID) -> MemoryEntry | None:
        entry = self.db.get(MemoryEntry, memory_id)
        if entry is None or entry.user_id != user_id:
            return None
        return entry

    def delete(self, user_id: uuid.UUID, memory_id: uuid.UUID) -> bool:
        entry = self.get(user_id, memory_id)
        if entry is None:
            return False
        self.db.delete(entry)
        self.db.commit()
        return True

    def as_context_text(self, user_id: uuid.UUID, limit: int = 20) -> str:
        """Compact text form of a user's memory, suitable for injecting into an agent prompt."""
        entries = self.list_for_user(user_id)[:limit]
        if not entries:
            return "(no long-term memory yet)"
        return "\n".join(f"- ({e.category}) {e.key}: {e.value}" for e in entries)
