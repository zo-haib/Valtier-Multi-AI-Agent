import { useEffect, useRef, useState } from "react";
import { UploadCloud, Search, Loader2, FileText, Trash2 } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { DataTable, type Column } from "../components/ui/Table";
import { StatusBadge } from "../components/ui/StatusBadge";
import { LoadingState, EmptyState } from "../components/ui/Feedback";
import { deleteDocument, listDocuments, searchKnowledge, uploadDocument } from "../services/knowledgeApi";
import type { KnowledgeDocument } from "../types";
import { useToast } from "../components/ui/Toast";

export function KnowledgePage() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<KnowledgeDocument[] | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listDocuments()
      .then(setDocuments)
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Could not load documents.", "error");
        setDocuments([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    try {
      const doc = await uploadDocument(file);
      setDocuments((prev) => [doc, ...(prev ?? [])]);
      showToast(
        doc.status === "ready" ? `${file.name} uploaded and ready.` : `${file.name} uploaded — processing failed.`,
        doc.status === "ready" ? "success" : "error"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev?.filter((d) => d.id !== id) ?? null);
      showToast("Document deleted.", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not delete document.", "error");
    }
  }

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setAnswer(null);
    try {
      const result = await searchKnowledge(query);
      setAnswer(result);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Search failed.", "error");
    } finally {
      setSearching(false);
    }
  }

  const columns: Column<KnowledgeDocument>[] = [
    { key: "name", header: "Document", render: (d) => <span className="font-medium text-brand-dark">{d.name}</span> },
    { key: "type", header: "Type", render: (d) => d.type },
    { key: "chunks", header: "Chunks", render: (d) => (d.chunks > 0 ? d.chunks : "—") },
    { key: "added", header: "Added", render: (d) => d.addedAgo },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
    {
      key: "actions",
      header: "",
      render: (d) => (
        <button
          onClick={() => handleDelete(d.id)}
          className="rounded-lg p-1.5 text-brand-dark/40 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Enterprise Knowledge</h1>
        <p className="mt-1 text-brand-dark/50">Give Valtier access to the information your organization already knows.</p>
      </div>

      <GlassCard
        padding="lg"
        className={`border-dashed transition-colors ${dragActive ? "border-brand-dark/40 bg-brand-light" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-dark/10 bg-brand-light">
            <UploadCloud className="h-5 w-5 text-brand-dark/60" />
          </span>
          <div>
            <p className="font-medium">Drop documents here</p>
            <p className="mt-1 text-sm text-brand-dark/40">PDF · DOCX · TXT · CSV</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Browse files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </GlassCard>

      <GlassCard padding="lg">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-brand-dark/60">
          <Search className="h-4 w-4" /> Ask your knowledge base…
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. What's our policy on password storage?"
            className="flex-1 rounded-xl border border-brand-dark/10 bg-brand-light px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 outline-none focus:border-brand-dark/30"
          />
          <Button onClick={handleSearch} disabled={!query.trim() || searching}>
            {searching && <Loader2 className="h-4 w-4 animate-spin" />}
            Search
          </Button>
        </div>
        {answer && (
          <div className="mt-4 rounded-xl border border-brand-dark/10 bg-brand-light p-4 text-sm text-brand-dark/80">
            <div className="mb-2 flex items-center gap-1.5 text-xs text-brand-dark/40">
              <FileText className="h-3.5 w-3.5" /> Retrieved from knowledge base
            </div>
            {answer}
          </div>
        )}
      </GlassCard>

      <div>
        <h2 className="mb-4 text-lg font-medium">Documents</h2>
        {!documents ? (
          <LoadingState label="Loading documents…" />
        ) : documents.length === 0 ? (
          <EmptyState icon={FileText} title="No documents yet" description="Upload your first document to get started." />
        ) : (
          <DataTable columns={columns} data={documents} />
        )}
      </div>
    </div>
  );
}
