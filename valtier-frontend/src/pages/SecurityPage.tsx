import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, ScanLine } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { StatCard } from "../components/ui/StatCard";
import { DataTable, type Column } from "../components/ui/Table";
import { StatusBadge } from "../components/ui/StatusBadge";
import { LoadingState, EmptyState } from "../components/ui/Feedback";
import { listSecurityRisks } from "../services/agentInsightsApi";
import type { SecurityRisk } from "../types";
import { cn } from "../lib/cn";

const SEVERITY_COLOR: Record<string, string> = {
  low: "text-brand-dark/50",
  medium: "text-amber-300",
  high: "text-orange-300",
  critical: "text-red-400",
};

export function SecurityPage() {
  const [risks, setRisks] = useState<SecurityRisk[] | null>(null);

  useEffect(() => {
    listSecurityRisks().then(setRisks);
  }, []);

  const columns: Column<SecurityRisk>[] = [
    { key: "title", header: "Risk", render: (r) => <span className="text-brand-dark">{r.title}</span> },
    {
      key: "severity",
      header: "Severity",
      render: (r) => (
        <span className={cn("font-medium capitalize", SEVERITY_COLOR[r.severity] ?? "text-brand-dark/70")}>
          {r.severity}
        </span>
      ),
    },
    { key: "category", header: "Category", render: (r) => r.category },
    {
      key: "source",
      header: "Found in",
      render: (r) => <span className="text-brand-dark/50">{r.sourceConversationTitle}</span>,
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const critical = risks?.filter((r) => r.severity === "critical" || r.severity === "high").length ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Security Center</h1>
        <p className="mt-1 text-brand-dark/50">Defensive risk assessment from your Security Agent.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total Findings" value={risks?.length ?? "—"} icon={ShieldCheck} />
        <StatCard label="High / Critical" value={critical} icon={AlertTriangle} />
        <StatCard label="Source" value="Live conversations" icon={ScanLine} />
      </div>

      <GlassCard padding="lg">
        <h2 className="mb-4 text-sm font-medium text-brand-dark/60">Risk register</h2>
        {!risks ? (
          <LoadingState label="Loading risks…" />
        ) : risks.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No findings yet"
            description="Ask the Security Agent to review a system and findings will show up here."
          />
        ) : (
          <DataTable columns={columns} data={risks} />
        )}
      </GlassCard>
    </div>
  );
}
