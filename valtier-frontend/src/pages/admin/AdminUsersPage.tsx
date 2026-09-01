import { useEffect, useState } from "react";
import { Search, Eye, Pencil, Ban, Trash2 } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { DataTable, type Column } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Avatar } from "../../components/ui/Feedback";
import { LoadingState } from "../../components/ui/Feedback";
import { listAdminUsers } from "../../services/adminApi";
import type { AdminUser } from "../../types";
import { useToast } from "../../components/ui/Toast";

export function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");

  useEffect(() => {
    listAdminUsers()
      .then(setUsers)
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Could not load users.", "error");
        setUsers([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = users?.filter(
    (u) =>
      (roleFilter === "all" || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
  );

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} size="sm" />
          <span className="text-brand-dark">{u.name}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (u) => <span className="text-brand-dark/60">{u.email}</span> },
    { key: "role", header: "Role", render: (u) => <span className="capitalize">{u.role}</span> },
    { key: "plan", header: "Plan", render: (u) => <span className="capitalize">{u.plan}</span> },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
    { key: "joined", header: "Joined", render: (u) => u.joinedAgo },
    {
      key: "actions",
      header: "Actions",
      render: () => (
        <div className="flex items-center gap-1">
          {[Eye, Pencil, Ban, Trash2].map((Icon, i) => (
            <button key={i} className="rounded-lg p-1.5 text-brand-dark/40 hover:bg-brand-dark/5 hover:text-brand-dark">
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Users</h1>
        <p className="mt-1 text-brand-dark/50">Manage every account on the Valtier platform.</p>
      </div>

      <GlassCard padding="md" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-brand-dark/10 bg-brand-light px-3 py-2">
          <Search className="h-4 w-4 text-brand-dark/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="w-full bg-transparent text-sm text-brand-dark placeholder:text-brand-dark/30 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "user", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-colors ${
                roleFilter === r ? "border-brand-dark/20 bg-brand-dark/5 text-brand-dark" : "border-brand-dark/10 bg-brand-light text-brand-dark/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </GlassCard>

      {!filtered ? <LoadingState label="Loading users…" /> : <DataTable columns={columns} data={filtered} />}
    </div>
  );
}
