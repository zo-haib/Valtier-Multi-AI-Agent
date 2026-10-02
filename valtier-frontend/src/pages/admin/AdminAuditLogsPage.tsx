import { useEffect, useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { DataTable, type Column } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { LoadingState } from "../../components/ui/Feedback";
import { listAuditLogs } from "../../services/adminApi";
import type { AuditLogEntry } from "../../types";
import { useToast } from "../../components/ui/Toast";

export function AdminAuditLogsPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLogEntry[] | null>(null);

  useEffect(() => {
    listAuditLogs()
      .then(setLogs)
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Could not load audit logs.", "error");
        setLogs([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: Column<AuditLogEntry>[] = [
    { key: "timestamp", header: "Timestamp", render: (l) => <span className="font-helvetica-neue text-xs text-brand-dark/60">{l.timestamp}</span> },
    { key: "user", header: "User", render: (l) => <span className="text-brand-dark">{l.user}</span> },
    { key: "action", header: "Action", render: (l) => l.action },
    { key: "resource", header: "Resource", render: (l) => <span className="text-brand-dark/50">{l.resource}</span> },
    { key: "ip", header: "IP", render: (l) => <span className="text-brand-dark/40">{l.ip}</span> },
    { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Audit Logs</h1>
        <p className="mt-1 text-brand-dark/50">Every security-relevant action across the platform.</p>
      </div>

      <GlassCard padding="lg">
        {!logs ? <LoadingState label="Loading audit logs…" /> : <DataTable columns={columns} data={logs} />}
      </GlassCard>
    </div>
  );
}
