import { useEffect, useRef, useState } from "react";
import { UploadCloud, Search, Loader2, FileText, Trash2, Database, Bot } from "lucide-react";
import { LoadingState, EmptyState } from "../components/ui/Feedback";
import { deleteDocument, listDocuments, searchKnowledge, uploadDocument } from "../services/knowledgeApi";
import type { KnowledgeDocument } from "../types";
import { useToast } from "../components/ui/Toast";
import { getAgentById } from "../data/agents";

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
        doc.status === "ready" ? `${file.name} uploaded and indexed.` : `${file.name} uploaded — processing failed.`,
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

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2 mb-2">
          <Database className="w-8 h-8 text-valtier-accent" />
          Enterprise Knowledge
        </h1>
        <p className="text-valtier-muted">Ground your AI workforce with your private documentation and data.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div
            className={`glass p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${dragActive ? "border-valtier-accent bg-valtier-accent/5 scale-[1.01]" : "border-valtier-border hover:border-valtier-accent/50"}`}
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
            <div className="w-16 h-16 rounded-full bg-valtier-surface border border-valtier-border flex items-center justify-center mb-4">
              <UploadCloud className="h-8 w-8 text-valtier-accent" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Upload Knowledge Source</h3>
            <p className="text-sm text-valtier-muted mb-6 max-w-md">Drag and drop files here to index them into Valtier's vector database. Supported formats: PDF, DOCX, TXT, CSV.</p>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading}
              className="bg-valtier-surface hover:bg-valtier-border text-white px-6 py-2.5 rounded-xl font-bold transition-all border border-valtier-border flex items-center gap-2"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin text-valtier-accent" />}
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.csv"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          <div className="glass p-6 rounded-2xl border border-valtier-border">
            <h2 className="mb-4 text-lg font-bold text-white">Indexed Sources</h2>
            {!documents ? (
              <LoadingState label="Loading vector store…" />
            ) : documents.length === 0 ? (
              <EmptyState icon={FileText} title="No sources yet" description="Upload your first document to ground your agents." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-valtier-border">
                      <th className="pb-3 text-xs font-bold text-valtier-muted uppercase tracking-wider">Document Name</th>
                      <th className="pb-3 text-xs font-bold text-valtier-muted uppercase tracking-wider">Type</th>
                      <th className="pb-3 text-xs font-bold text-valtier-muted uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-xs font-bold text-valtier-muted uppercase tracking-wider">Chunks</th>
                      <th className="pb-3 text-xs font-bold text-valtier-muted uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(d => (
                      <tr key={d.id} className="border-b border-valtier-border/50 hover:bg-valtier-surface/50 transition-colors">
                        <td className="py-4 text-sm font-medium text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-valtier-muted" />
                          {d.name}
                        </td>
                        <td className="py-4 text-sm text-valtier-muted uppercase">{d.type}</td>
                        <td className="py-4">
                           <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${d.status === 'ready' ? 'bg-valtier-emerald/10 text-valtier-emerald border-valtier-emerald/20' : d.status === 'processing' ? 'bg-valtier-amber/10 text-valtier-amber border-valtier-amber/20 animate-pulse' : 'bg-valtier-rose/10 text-valtier-rose border-valtier-rose/20'}`}>
                             {d.status}
                           </div>
                        </td>
                        <td className="py-4 text-sm text-valtier-muted">{d.chunks > 0 ? d.chunks.toLocaleString() : "—"}</td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="p-1.5 text-valtier-muted hover:text-valtier-rose hover:bg-valtier-rose/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl border border-valtier-border">
            <h3 className="mb-4 text-sm font-bold text-valtier-muted uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4" /> Knowledge Query
            </h3>
            <p className="text-xs text-valtier-muted mb-4">Test vector search retrieval manually before assigning agents.</p>
            <div className="flex flex-col gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search corpus..."
                className="w-full rounded-xl border border-valtier-border bg-valtier-bg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-valtier-accent focus:ring-1 focus:ring-valtier-accent"
              />
              <button 
                onClick={handleSearch} 
                disabled={!query.trim() || searching}
                className="w-full bg-valtier-surface hover:bg-valtier-border text-white py-2.5 rounded-xl font-bold transition-all border border-valtier-border flex justify-center items-center gap-2"
              >
                {searching && <Loader2 className="h-4 w-4 animate-spin text-valtier-accent" />}
                Run Query
              </button>
            </div>
            {answer && (
              <div className="mt-4 animate-fade-in">
                <div className="p-4 bg-valtier-bg border border-valtier-border rounded-xl text-sm text-white prose prose-invert">
                  {answer}
                </div>
              </div>
            )}
          </div>

          <div className="glass p-6 rounded-2xl border border-valtier-border">
            <h3 className="mb-4 text-sm font-bold text-valtier-muted uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4" /> Connected Agents
            </h3>
            <p className="text-xs text-valtier-muted mb-4">These agents currently have access to the knowledge base during missions.</p>
            <div className="flex flex-col gap-2">
               {["researcher", "analyst", "manager"].map(id => {
                 const agent = getAgentById(id);
                 if (!agent) return null;
                 return (
                   <div key={id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-valtier-surface transition-colors cursor-pointer">
                     <div className="w-8 h-8 rounded-lg bg-valtier-card border border-valtier-border flex items-center justify-center">
                       {agent.icon && <agent.icon className="w-4 h-4 text-valtier-accent" />}
                     </div>
                     <span className="text-sm font-medium text-white">{agent.name}</span>
                     <span className="ml-auto w-2 h-2 rounded-full bg-valtier-emerald"></span>
                   </div>
                 )
               })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
