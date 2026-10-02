import { useEffect, useState } from "react";
import { CreditCard, Edit2, PauseCircle, PlayCircle, XCircle, RefreshCcw } from "lucide-react";
import { DataTable, type Column } from "../../components/ui/Table";
import { LoadingState } from "../../components/ui/Feedback";
import { listAdminSubscriptions } from "../../services/adminApi";
import type { AdminSubscription } from "../../types";
import { cn } from "../../lib/cn";
import { useToast } from "../../components/ui/Toast";
import { Modal } from "../../components/ui/Modal";

const FILTERS = ["All", "Active", "Cancelled", "Past Due"] as const;

export function AdminSubscriptionsPage() {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  
  const [selectedSub, setSelectedSub] = useState<AdminSubscription | null>(null);

  useEffect(() => {
    listAdminSubscriptions()
      .then(setSubscriptions)
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Could not load subscriptions.", "error");
        setSubscriptions([]);
      });
  }, []);

  const handleAction = (action: string) => {
    showToast(`Subscription ${action} triggered.`, "success");
    setSelectedSub(null);
  }

  const statusMap: Record<(typeof FILTERS)[number], AdminSubscription["status"] | null> = {
    All: null,
    Active: "active",
    Cancelled: "cancelled",
    "Past Due": "past_due",
  };

  const filtered = subscriptions?.filter((s) => {
    const target = statusMap[filter];
    return !target || s.status === target;
  });

  const columns: Column<AdminSubscription>[] = [
    { key: "customer", header: "Customer", render: (s) => <span className="font-bold text-white">{s.customer}</span> },
    { key: "plan", header: "Plan", render: (s) => <span className="capitalize font-bold text-valtier-accent">{s.plan}</span> },
    { key: "billing", header: "Billing", render: (s) => <span className="capitalize text-sm text-valtier-muted">{s.billing}</span> },
    { key: "amount", header: "Amount", render: (s) => (s.amount > 0 ? <span className="font-mono text-white">${s.amount.toLocaleString()}</span> : "—") },
    { key: "status", header: "Status", render: (s) => <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status === 'active' ? 'bg-valtier-emerald/20 text-valtier-emerald' : s.status === 'past_due' ? 'bg-valtier-amber/20 text-valtier-amber' : 'bg-valtier-rose/20 text-valtier-rose'}`}>{s.status.replace("_", " ")}</span> },
    { key: "renewal", header: "Renewal", render: (s) => <span className="text-sm text-valtier-muted">{s.renewalDate}</span> },
    {
      key: "actions",
      header: "",
      render: (s) => (
        <button onClick={() => setSelectedSub(s)} className="text-sm font-bold text-valtier-accent hover:text-valtier-accent-hover transition-colors">
          Manage
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-valtier-accent" />
          Subscriptions
        </h1>
        <p className="text-valtier-muted">Manage billing status across every Valtier customer.</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
              filter === f ? "border-valtier-accent bg-valtier-accent/20 text-valtier-accent shadow-glow-sm" : "border-valtier-border bg-valtier-surface text-valtier-muted hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl border border-valtier-border overflow-hidden">
        {!filtered ? <LoadingState label="Loading subscriptions…" /> : <DataTable columns={columns} data={filtered} />}
      </div>

      {selectedSub && (
        <Modal open={true} onClose={() => setSelectedSub(null)} title="Manage Subscription">
          <div className="flex flex-col gap-6 p-2">
            <div className="flex justify-between items-center bg-valtier-surface p-4 rounded-xl border border-valtier-border">
              <div>
                <p className="text-xs text-valtier-muted uppercase tracking-wider mb-1">Customer</p>
                <p className="font-bold text-white text-lg">{selectedSub.customer}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-valtier-muted uppercase tracking-wider mb-1">Plan</p>
                <p className="font-bold text-valtier-accent text-lg capitalize">{selectedSub.plan} ({selectedSub.billing})</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleAction("plan change")} className="glass p-4 rounded-xl border border-valtier-border hover:border-valtier-accent/50 text-left transition-all flex flex-col gap-2 group">
                <Edit2 className="w-5 h-5 text-valtier-muted group-hover:text-valtier-accent transition-colors" />
                <span className="font-bold text-white text-sm">Change Plan</span>
              </button>
              
              {selectedSub.status === "active" ? (
                <button onClick={() => handleAction("pause")} className="glass p-4 rounded-xl border border-valtier-border hover:border-valtier-amber/50 text-left transition-all flex flex-col gap-2 group">
                  <PauseCircle className="w-5 h-5 text-valtier-muted group-hover:text-valtier-amber transition-colors" />
                  <span className="font-bold text-white text-sm">Pause Sub</span>
                </button>
              ) : (
                <button onClick={() => handleAction("reactivate")} className="glass p-4 rounded-xl border border-valtier-border hover:border-valtier-emerald/50 text-left transition-all flex flex-col gap-2 group">
                  <PlayCircle className="w-5 h-5 text-valtier-muted group-hover:text-valtier-emerald transition-colors" />
                  <span className="font-bold text-white text-sm">Reactivate</span>
                </button>
              )}

              <button onClick={() => handleAction("extend")} className="glass p-4 rounded-xl border border-valtier-border hover:border-valtier-emerald/50 text-left transition-all flex flex-col gap-2 group">
                <RefreshCcw className="w-5 h-5 text-valtier-muted group-hover:text-valtier-emerald transition-colors" />
                <span className="font-bold text-white text-sm">Extend Trial/Sub</span>
              </button>

              <button onClick={() => handleAction("cancel")} className="glass p-4 rounded-xl border border-valtier-border hover:border-valtier-rose/50 text-left transition-all flex flex-col gap-2 group">
                <XCircle className="w-5 h-5 text-valtier-muted group-hover:text-valtier-rose transition-colors" />
                <span className="font-bold text-white text-sm">Cancel & Refund</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
