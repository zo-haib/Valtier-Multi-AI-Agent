"""
Document service: validates and stores an uploaded file, tracks its
metadata row, and runs it through the RAG ingestion pipeline. Users
may only ever list/fetch/delete their own documents.
"""
from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppError, ForbiddenError, NotFoundError
from app.models.document import Document, DocumentStatus
from app.rag.retriever import delete_document_vectors, ingest_document
from app.utils.logging import get_logger

logger = get_logger("RAG SERVICE")

# Real file-content signatures, checked in addition to the extension.
# A renamed file (e.g. a script saved as "notes.pdf") has the right
# extension but the wrong bytes, and would otherwise sail past
# `_validate_upload`'s extension-only check straight into the parser
# and the RAG pipeline (QA: "Unrestricted File Ingestion").
_PDF_SIGNATURE = b"%PDF-"
_ZIP_SIGNATURES = (b"PK\x03\x04", b"PK\x05\x06", b"PK\x07\x08")  # DOCX is a ZIP container


def _looks_like_pdf(content: bytes) -> bool:
    return content.startswith(_PDF_SIGNATURE)


def _looks_like_docx(content: bytes) -> bool:
    return content[:4] in _ZIP_SIGNATURES


def _looks_like_text(content: bytes) -> bool:
    """Plain-text/CSV heuristic: decodes as UTF-8 and contains no NUL bytes."""
    if b"\x00" in content:
        return False
    try:
        content.decode("utf-8")
        return True
    except UnicodeDecodeError:
        return False


_SIGNATURE_CHECKS = {
    ".pdf": _looks_like_pdf,
    ".docx": _looks_like_docx,
    ".txt": _looks_like_text,
    ".csv": _looks_like_text,
}


def _validate_upload(file: UploadFile, content: bytes) -> str:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in settings.allowed_upload_extensions:
        raise AppError(
            f"Unsupported file type '{ext}'. Allowed types: {', '.join(settings.allowed_upload_extensions)}"
        )

    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise AppError(f"File exceeds the {settings.max_upload_size_mb}MB upload limit")

    if not content:
        raise AppError("Uploaded file is empty")

    signature_check = _SIGNATURE_CHECKS.get(ext)
    if signature_check and not signature_check(content):
        raise AppError(
            f"File content does not match its '{ext}' extension. "
            "Rename or re-export the file and try again."
        )

    return ext


async def save_and_ingest(db: Session, user_id: uuid.UUID, file: UploadFile) -> Document:
    content = await file.read()
    ext = _validate_upload(file, content)

    upload_dir = Path(settings.upload_dir) / str(user_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    document_id = uuid.uuid4()
    storage_path = upload_dir / f"{document_id}{ext}"
    storage_path.write_bytes(content)

    document = Document(
        id=document_id,
        user_id=user_id,
        filename=file.filename or storage_path.name,
        storage_path=str(storage_path),
        file_type=ext.lstrip("."),
        file_size=len(content),
        status=DocumentStatus.PROCESSING,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        chunk_count = ingest_document(str(storage_path), user_id=str(user_id), document_id=str(document_id))
        document.status = DocumentStatus.READY
        document.chunk_count = chunk_count
    except Exception as exc:  # noqa: BLE001 - ingestion must never crash the upload request
        logger.warning(f"Ingestion failed for document {document_id}: {exc}")
        document.status = DocumentStatus.FAILED
        document.error_message = str(exc)[:1000]

    db.commit()
    db.refresh(document)
    return document


def list_documents(db: Session, user_id: uuid.UUID) -> list[Document]:
    return list(
        db.scalars(select(Document).where(Document.user_id == user_id).order_by(Document.created_at.desc()))
    )


def get_document(db: Session, user_id: uuid.UUID, document_id: uuid.UUID) -> Document:
    document = db.get(Document, document_id)
    if document is None:
        raise NotFoundError("Document not found")
    if document.user_id != user_id:
        raise ForbiddenError("You do not have access to this document")
    return document


def delete_document(db: Session, user_id: uuid.UUID, document_id: uuid.UUID) -> None:
    document = get_document(db, user_id, document_id)
    delete_document_vectors(str(document.id))
    storage_path = Path(document.storage_path)
    if storage_path.exists():
        storage_path.unlink(missing_ok=True)
    db.delete(document)
    db.commit()
