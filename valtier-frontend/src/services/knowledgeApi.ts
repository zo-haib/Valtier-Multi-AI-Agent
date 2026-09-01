import type { KnowledgeDocument } from "../types";
import { apiFetch, apiUpload } from "./client";

interface DocumentReadRaw {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: "pending" | "processing" | "ready" | "failed";
  chunk_count: number;
  error_message: string | null;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function mapDocument(raw: DocumentReadRaw): KnowledgeDocument {
  return {
    id: raw.id,
    name: raw.filename,
    type: raw.file_type.toUpperCase() as KnowledgeDocument["type"],
    chunks: raw.chunk_count,
    addedAgo: timeAgo(raw.created_at),
    status: raw.status === "ready" ? "ready" : raw.status === "failed" ? "failed" : "processing",
  };
}

// GET /api/v1/documents
export async function listDocuments(): Promise<KnowledgeDocument[]> {
  const raw = await apiFetch<DocumentReadRaw[]>("/documents");
  return raw.map(mapDocument);
}

// POST /api/v1/documents/upload (multipart/form-data)
export async function uploadDocument(file: File): Promise<KnowledgeDocument> {
  const formData = new FormData();
  formData.append("file", file);
  const raw = await apiUpload<DocumentReadRaw>("/documents/upload", formData);
  return mapDocument(raw);
}

// DELETE /api/v1/documents/{id}
export async function deleteDocument(id: string): Promise<void> {
  await apiFetch<void>(`/documents/${id}`, { method: "DELETE" });
}

/**
 * There's no standalone "query the knowledge base" endpoint — RAG
 * retrieval happens automatically inside /agents/run when the
 * orchestrator decides a request needs enterprise knowledge. This
 * routes the search box through that same endpoint.
 */
export async function searchKnowledge(query: string): Promise<string> {
  const raw = await apiFetch<{ result: string }>("/agents/run", {
    method: "POST",
    body: JSON.stringify({ task: query, conversation_id: null }),
  });
  return raw.result;
}
