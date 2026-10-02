"""Audit logging service — records security-relevant actions to the audit_logs table."""
from __future__ import annotations

import uuid
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def record_audit_event(
    db: Session,
    action: str,
    user_id: Optional[uuid.UUID] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        user_agent=user_agent,
        log_metadata=metadata,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
