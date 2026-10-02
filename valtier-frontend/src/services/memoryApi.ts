import type { MemoryEntry } from "../types";
import { apiFetch } from "./client";

interface MemoryEntryReadRaw {
  id: string;
  category: string;
  key: string;
  value: string;
  created_at: string;
}

const VALID_CATEGORIES: MemoryEntry["category"][] = [
  "User Preferences",
  "Business Context",
  "Projects",
  "Decisions",
  "Important Facts",
];

function timeAgo(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function mapMemory(raw: MemoryEntryReadRaw): MemoryEntry {
  const category = VALID_CATEGORIES.includes(raw.category as MemoryEntry["category"])
    ? (raw.category as MemoryEntry["category"])
    : "Important Facts";
  return { id: raw.id, category, content: raw.value, source: "Manual entry", createdAt: timeAgo(raw.created_at) };
}

// GET /api/v1/memory
export async function listMemories(): Promise<MemoryEntry[]> {
  const raw = await apiFetch<MemoryEntryReadRaw[]>("/memory");
  return raw.map(mapMemory);
}

// POST /api/v1/memory — the backend requires a `key`; since the UI only
// collects free-text content, a short timestamp-based key is generated.
export async function createMemory(category: MemoryEntry["category"], content: string): Promise<MemoryEntry> {
  const key = `note-${Date.now()}`;
  const raw = await apiFetch<MemoryEntryReadRaw>("/memory", {
    method: "POST",
    body: JSON.stringify({ category, key, value: content }),
  });
  return mapMemory(raw);
}

// DELETE /api/v1/memory/{id}
export async function deleteMemory(id: string): Promise<void> {
  await apiFetch<void>(`/memory/${id}`, { method: "DELETE" });
}
