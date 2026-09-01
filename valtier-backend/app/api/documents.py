"""Document upload and management endpoints (RAG knowledge base). Per-user isolation enforced."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_client_ip, get_current_user
from app.core.exceptions import AppError
from app.models.user import User
from app.schemas.document import DocumentRead
from app.services import rag_service, subscription_service
from app.services.audit_service import record_audit_event
from app.services.plan_catalog import PLAN_CATALOG

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentRead:
    subscription = subscription_service.get_subscription_for_user(db, current_user)
    plan_features = PLAN_CATALOG[subscription.plan]

    existing_count = len(rag_service.list_documents(db, current_user.id))
    if existing_count >= plan_features.document_limit:
        raise AppError(
            f"Document limit reached for the {subscription.plan.value} plan "
            f"({plan_features.document_limit} documents). Upgrade your plan to upload more."
        )

    document = await rag_service.save_and_ingest(db, current_user.id, file)

    record_audit_event(
        db,
        action="document_upload",
        user_id=current_user.id,
        resource_type="document",
        resource_id=str(document.id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
        metadata={"filename": document.filename, "status": document.status.value},
    )
    return document


@router.get("", response_model=list[DocumentRead])
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[DocumentRead]:
    return rag_service.list_documents(db, current_user.id)


@router.get("/{document_id}", response_model=DocumentRead)
def get_document(
    document_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> DocumentRead:
    return rag_service.get_document(db, current_user.id, document_id)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    rag_service.delete_document(db, current_user.id, document_id)
    record_audit_event(
        db,
        action="document_deletion",
        user_id=current_user.id,
        resource_type="document",
        resource_id=str(document_id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
