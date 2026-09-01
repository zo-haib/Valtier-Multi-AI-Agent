import { useEffect, useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { DataTable, type Column } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { LoadingState } from "../../components/ui/Feedback";
import { listAdminSubscriptions } from "../../services/adminApi";
import type { AdminSubscription } from "../../types";
import { cn } from "../../lib/cn";
import { useToast } from "../../components/ui/Toast";

const FILTERS = ["All", "Active", "Cancelled", "Past Due"] as const;

export function AdminSubscriptionsPage() {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  useEffect(() => {
    listAdminSubscriptions()
      .then(setSubscriptions)
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Could not load subscriptions.", "error");
        setSubscriptions([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    { key: "customer", header: "Customer", render: (s) => <span className="text-brand-dark">{s.customer}</span> },
    { key: "plan", header: "Plan", render: (s) => <span className="capitalize">{s.plan}</span> },
    { key: "billing", header: "Billing", render: (s) => <span className="capitalize">{s.billing}</span> },
    { key: "amount", header: "Amount", render: (s) => (s.amount > 0 ? `$${s.amount.toLocaleString()}` : "—") },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
    { key: "renewal", header: "Renewal", render: (s) => s.renewalDate },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Subscriptions</h1>
        <p className="mt-1 text-brand-dark/50">Billing status across every Valtier customer.</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              filter === f ? "border-brand-dark/20 bg-brand-dark/5 text-brand-dark" : "border-brand-dark/10 bg-brand-light text-brand-dark/50 hover:text-brand-dark"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <GlassCard padding="lg">
        {!filtered ? <LoadingState label="Loading subscriptions…" /> : <DataTable columns={columns} data={filtered} />}
      </GlassCard>
    </div>
  );
}
