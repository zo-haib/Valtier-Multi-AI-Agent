"""Small pagination helper used by admin list endpoints."""
from __future__ import annotations

from typing import Any, Sequence

from sqlalchemy import Select, func
from sqlalchemy.orm import Session


def paginate(db: Session, stmt: Select, page: int, page_size: int) -> tuple[int, Sequence[Any]]:
    """Return (total_count, page_items) for a single-entity SQLAlchemy select statement."""
    page = max(page, 1)
    page_size = max(1, min(page_size, 200))

    total = db.scalar(func.count().select().select_from(stmt.subquery())) or 0
    items = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all()
    return total, items


def paginate_rows(db: Session, stmt: Select, page: int, page_size: int) -> tuple[int, Sequence[Any]]:
    """
    Like paginate(), but for a multi-column select (e.g. a join selecting
    two entities/columns) where db.scalars() would silently drop every
    column but the first. Returns SQLAlchemy Row objects instead.
    """
    page = max(page, 1)
    page_size = max(1, min(page_size, 200))

    total = db.scalar(func.count().select().select_from(stmt.subquery())) or 0
    rows = db.execute(stmt.offset((page - 1) * page_size).limit(page_size)).all()
    return total, rows
