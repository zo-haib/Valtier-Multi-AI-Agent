import { useEffect, useState } from "react";
import { BrainCircuit, Trash2, Plus } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { LoadingState, EmptyState } from "../components/ui/Feedback";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Select, Textarea } from "../components/ui/Input";
import { listMemories, deleteMemory, createMemory } from "../services/memoryApi";
import type { MemoryEntry } from "../types";
import { useToast } from "../components/ui/Toast";

const CATEGORIES: MemoryEntry["category"][] = [
  "User Preferences",
  "Business Context",
  "Projects",
  "Decisions",
  "Important Facts",
];

export function MemoryPage() {
  const { showToast } = useToast();
  const [memories, setMemories] = useState<MemoryEntry[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<MemoryEntry["category"] | "All">("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<MemoryEntry["category"]>("Important Facts");
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listMemories()
      .then(setMemories)
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Could not load memory.", "error");
        setMemories([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteMemory(id);
      setMemories((prev) => prev?.filter((m) => m.id !== id) ?? null);
      showToast("Memory deleted.", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not delete memory.", "error");
    }
  }

  async function handleCreate() {
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      const entry = await createMemory(newCategory, newContent.trim());
      setMemories((prev) => [entry, ...(prev ?? [])]);
      setModalOpen(false);
      setNewContent("");
      showToast("Memory saved.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save memory.", "error");
    } finally {
      setSaving(false);
    }
  }

  const filtered = memories?.filter((m) => activeCategory === "All" || m.category === activeCategory);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Agent Memory</h1>
          <p className="mt-1 max-w-2xl text-brand-dark/50">
            Valtier remembers important context so your AI workforce becomes more useful over time.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Add memory
        </Button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {(["All", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              activeCategory === cat
                ? "border-brand-dark/20 bg-brand-dark/5 text-brand-dark"
                : "border-brand-dark/10 bg-brand-light text-brand-dark/50 hover:text-brand-dark"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {!memories ? (
        <LoadingState label="Loading memory…" />
      ) : filtered && filtered.length === 0 ? (
        <EmptyState
          icon={BrainCircuit}
          title="No memories in this category"
          description="Add one manually, or it'll fill in as Valtier learns from your conversations."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((mem) => (
            <GlassCard key={mem.id} hover padding="md" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-brand-dark/10 bg-brand-light px-2.5 py-1 text-xs text-brand-dark/50">
                  {mem.category}
                </span>
                <BrainCircuit className="h-4 w-4 text-brand-dark/30" />
              </div>
              <p className="text-sm text-brand-dark/80">{mem.content}</p>
              <div className="mt-auto flex items-center justify-between border-t border-brand-dark/5 pt-3 text-xs text-brand-dark/40">
                <span>{mem.source} · {mem.createdAt}</span>
                <button onClick={() => handleDelete(mem.id)} className="rounded-lg p-1.5 hover:bg-red-500/10 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add memory">
        <div className="flex flex-col gap-4">
          <Select
            label="Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as MemoryEntry["category"])}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Textarea
            label="What should Valtier remember?"
            rows={4}
            placeholder="e.g. We prioritize enterprise clients over SMB."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <Button onClick={handleCreate} disabled={!newContent.trim() || saving} className="w-full">
            Save memory
          </Button>
        </div>
      </Modal>
    </div>
  );
}
