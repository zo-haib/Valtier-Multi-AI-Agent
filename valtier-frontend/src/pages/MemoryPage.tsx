import { useEffect, useState } from "react";
import { BrainCircuit, Trash2, Plus, Sparkles, Search } from "lucide-react";
import { LoadingState, EmptyState } from "../components/ui/Feedback";
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
  const [search, setSearch] = useState("");
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

  const filtered = memories?.filter((m) => 
    (activeCategory === "All" || m.category === activeCategory) &&
    (search === "" || m.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2 mb-2">
            <BrainCircuit className="w-8 h-8 text-valtier-purple" />
            Valtier Memory
          </h1>
          <p className="text-valtier-muted">
            The shared context layer for your AI workforce.
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-valtier-surface hover:bg-valtier-border text-white px-5 py-2.5 rounded-xl font-bold transition-all border border-valtier-border flex items-center gap-2 shadow-glow-sm"
        >
          <Plus className="h-4 w-4 text-valtier-accent" /> Add Memory
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-valtier-surface/50 p-4 rounded-2xl border border-valtier-border">
        <div className="no-scrollbar flex gap-2 overflow-x-auto w-full md:w-auto">
          {(["All", ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "bg-valtier-purple/20 text-valtier-purple border border-valtier-purple/30 shadow-glow-sm"
                  : "bg-valtier-bg text-valtier-muted border border-valtier-border hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-valtier-muted" />
          <input 
            type="text" 
            placeholder="Search memories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-valtier-bg border border-valtier-border rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-valtier-purple focus:ring-1 focus:ring-valtier-purple transition-all"
          />
        </div>
      </div>

      {!memories ? (
        <LoadingState label="Loading memory core…" />
      ) : filtered && filtered.length === 0 ? (
        <EmptyState
          icon={BrainCircuit}
          title="No memories found"
          description="Valtier hasn't learned anything in this category yet."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((mem) => (
            <div key={mem.id} className="glass p-5 rounded-2xl border border-valtier-border hover:border-valtier-purple/50 transition-all flex flex-col gap-4 group">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-valtier-surface border border-valtier-border px-2.5 py-1 text-xs font-bold text-valtier-muted">
                  {mem.category}
                </span>
                <BrainCircuit className="h-4 w-4 text-valtier-purple/50 group-hover:text-valtier-purple transition-colors" />
              </div>
              <p className="text-sm text-white font-medium leading-relaxed">{mem.content}</p>
              <div className="mt-auto flex items-center justify-between border-t border-valtier-border pt-4 text-xs font-medium text-valtier-muted">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-valtier-accent" />
                  <span>{mem.source}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{mem.createdAt}</span>
                  <button onClick={() => handleDelete(mem.id)} className="p-1 hover:text-valtier-rose transition-colors" title="Delete memory">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add to Valtier Memory">
        <div className="flex flex-col gap-5 p-2">
          <div className="bg-valtier-accent/10 border border-valtier-accent/20 rounded-xl p-4 text-sm text-white flex gap-3">
            <Sparkles className="w-5 h-5 text-valtier-accent shrink-0" />
            <p>Memories added here become instantly accessible to all your agents during missions.</p>
          </div>
          <Select
            label="Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as MemoryEntry["category"])}
            className="bg-valtier-bg border-valtier-border text-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          <Textarea
            label="Memory Content"
            rows={4}
            placeholder="e.g. We prioritize enterprise clients over SMB."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="bg-valtier-bg border-valtier-border text-white"
          />
          <button 
            onClick={handleCreate} 
            disabled={!newContent.trim() || saving} 
            className="w-full bg-valtier-accent hover:bg-valtier-accent-hover text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm"
          >
            {saving ? "Encrypting and Saving..." : "Save to Memory Core"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
