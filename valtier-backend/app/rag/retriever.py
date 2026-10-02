"""
Retriever: Similarity Search -> Retrieved Context, scoped per user.
Also exposes the ingestion helper used by the document upload pipeline.
"""
from __future__ import annotations

from typing import Optional

from app.rag.loader import load_document, split_text
from app.rag.vector_store import get_vector_store
from app.utils.logging import get_logger

logger = get_logger("RAG")


def ingest_document(path: str, user_id: str, document_id: str) -> int:
    """Full ingestion: Document -> Text Extraction -> Chunking -> Embeddings -> Vector Store."""
    text = load_document(path)
    chunks = split_text(text)
    store = get_vector_store()
    return store.add_chunks(chunks, user_id=user_id, document_id=document_id, source=path)


def retrieve(query: str, user_id: Optional[str], k: int = 4) -> list[dict[str, object]]:
    """Similarity search scoped to a single user's documents."""
    if not user_id:
        return []
    store = get_vector_store()
    return store.similarity_search(query, user_id=user_id, k=k)


def delete_document_vectors(document_id: str) -> None:
    get_vector_store().delete_document(document_id)
