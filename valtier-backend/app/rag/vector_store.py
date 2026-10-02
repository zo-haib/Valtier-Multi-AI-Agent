"""
Vector store stage of the RAG pipeline: Embeddings -> Vector Store.

A single persisted Chroma collection is used, with every chunk tagged
with `user_id` and `document_id` metadata so retrieval can be scoped
to one user's documents — users must never retrieve each other's
knowledge base content.
"""
from __future__ import annotations

import threading
from typing import Optional

from app.core.config import settings
from app.rag.embeddings import get_embeddings
from app.utils.logging import get_logger

logger = get_logger("VECTOR STORE")

_COLLECTION_NAME = "valtier_backend_documents"

# Chroma's default persistent client is backed by a local SQLite file,
# which does not tolerate concurrent writers well — parallel uploads
# from multiple users/threads can hit lock/corruption errors (QA:
# "Concurrency Crashes"). FastAPI runs sync route handlers in a
# thread pool, so this genuinely can happen under real traffic. A
# process-wide lock serializes writes without limiting concurrent
# reads. Migrating to Chroma server mode or PGVector removes this
# constraint entirely and is the recommended path for real multi-user
# production scale.
_write_lock = threading.Lock()


class VectorStore:
    def __init__(self, persist_path: Optional[str] = None) -> None:
        from langchain_chroma import Chroma

        self._store = Chroma(
            collection_name=_COLLECTION_NAME,
            embedding_function=get_embeddings(),
            persist_directory=persist_path or settings.vector_store_path,
        )

    def add_chunks(self, chunks: list[str], user_id: str, document_id: str, source: str) -> int:
        if not chunks:
            return 0
        metadatas = [{"user_id": user_id, "document_id": document_id, "source": source} for _ in chunks]
        with _write_lock:
            self._store.add_texts(texts=chunks, metadatas=metadatas)
        logger.info(f"Added {len(chunks)} chunks for user={user_id} document={document_id}")
        return len(chunks)

    def similarity_search(self, query: str, user_id: str, k: int = 4) -> list[dict[str, object]]:
        """Search restricted to the given user's own chunks only."""
        try:
            results = self._store.similarity_search_with_score(query, k=k, filter={"user_id": user_id})
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"Similarity search failed: {exc}")
            return []

        return [
            {
                "text": doc.page_content,
                "source": doc.metadata.get("source", "unknown"),
                "document_id": doc.metadata.get("document_id"),
                "score": float(score),
            }
            for doc, score in results
        ]

    def delete_document(self, document_id: str) -> None:
        try:
            with _write_lock:
                self._store.delete(where={"document_id": document_id})
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"Failed to delete vectors for document {document_id}: {exc}")


_default_store: Optional[VectorStore] = None


def get_vector_store() -> VectorStore:
    global _default_store
    if _default_store is None:
        _default_store = VectorStore()
    return _default_store
