import { useEffect, useState } from "react";
import { Search, Eye, Ban, Trash2, Edit2, Play, Users } from "lucide-react";
import { DataTable, type Column } from "../../components/ui/Table";
import { Avatar } from "../../components/ui/Feedback";
import { LoadingState } from "../../components/ui/Feedback";
import { listAdminUsers } from "../../services/adminApi";
import type { AdminUser } from "../../types";
import { useToast } from "../../components/ui/Toast";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Input";

export function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");

  const [confirmAction, setConfirmAction] = useState<{user: AdminUser, type: "suspend" | "reactivate" | "delete" | "change_plan"} | null>(null);
  const [newPlan, setNewPlan] = useState<"free" | "pro" | "enterprise">("pro");

  useEffect(() => {
    listAdminUsers()
      .then(setUsers)
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Could not load users.", "error");
        setUsers([]);
      });
  }, []);

  const handleAction = () => {
    if (!confirmAction) return;
    const { user, type } = confirmAction;

    setUsers(prev => prev?.map(u => {
      if (u.id === user.id) {
        if (type === "suspend") return { ...u, status: "suspended" };
        if (type === "reactivate") return { ...u, status: "active" };
        if (type === "change_plan") return { ...u, plan: newPlan };
      }
      return u;
    }) ?? null);
    
    showToast(`Action ${type} applied to ${user.name}.`, "success");
    setConfirmAction(null);
  };

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
        <div className="flex items-center gap-3 font-medium">
          <Avatar name={u.name} size="sm" />
          <span className="text-white">{u.name}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (u) => <span className="text-valtier-muted text-sm">{u.email}</span> },
    { key: "role", header: "Role", render: (u) => <span className="capitalize text-sm font-bold">{u.role}</span> },
    { key: "plan", header: "Plan", render: (u) => <span className="capitalize text-sm text-valtier-accent font-bold">{u.plan}</span> },
    { key: "usage", header: "AI Credits", render: () => <span className="text-sm font-mono">{Math.floor(Math.random() * 5000)}</span> },
    { key: "status", header: "Status", render: (u) => <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === 'active' ? 'bg-valtier-emerald/20 text-valtier-emerald' : 'bg-valtier-rose/20 text-valtier-rose'}`}>{u.status}</span> },
    { key: "joined", header: "Joined", render: (u) => <span className="text-sm text-valtier-muted">{u.joinedAgo}</span> },
    {
      key: "actions",
      header: "",
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button title="View Activity" className="rounded-lg p-1.5 text-valtier-muted hover:bg-valtier-surface hover:text-white transition-colors">
            <Eye className="h-4 w-4" />
          </button>
          <button title="Change Plan" onClick={() => setConfirmAction({ user: u, type: "change_plan" })} className="rounded-lg p-1.5 text-valtier-muted hover:bg-valtier-surface hover:text-white transition-colors">
            <Edit2 className="h-4 w-4" />
          </button>
          {u.status === "active" ? (
            <button title="Suspend User" onClick={() => setConfirmAction({ user: u, type: "suspend" })} className="rounded-lg p-1.5 text-valtier-muted hover:bg-valtier-amber/10 hover:text-valtier-amber transition-colors">
              <Ban className="h-4 w-4" />
            </button>
          ) : (
            <button title="Reactivate User" onClick={() => setConfirmAction({ user: u, type: "reactivate" })} className="rounded-lg p-1.5 text-valtier-muted hover:bg-valtier-emerald/10 hover:text-valtier-emerald transition-colors">
              <Play className="h-4 w-4" />
            </button>
          )}
          <button title="Delete User" onClick={() => setConfirmAction({ user: u, type: "delete" })} className="rounded-lg p-1.5 text-valtier-muted hover:bg-valtier-rose/10 hover:text-valtier-rose transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-valtier-accent" /> Users
        </h1>
        <p className="text-valtier-muted">Manage all accounts on the Valtier platform.</p>
      </div>

      <div className="glass p-4 rounded-2xl flex flex-col gap-3 sm:flex-row sm:items-center border border-valtier-border">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-valtier-border bg-valtier-bg px-3 py-2">
          <Search className="h-4 w-4 text-valtier-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-transparent text-sm text-white placeholder:text-valtier-muted outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "user", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                roleFilter === r ? "border-valtier-accent bg-valtier-accent/20 text-valtier-accent shadow-glow-sm" : "border-valtier-border bg-valtier-surface text-valtier-muted hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl border border-valtier-border overflow-hidden">
        {!filtered ? <LoadingState label="Loading users…" /> : <DataTable columns={columns} data={filtered} />}
      </div>

      {confirmAction && (
        <Modal open={true} onClose={() => setConfirmAction(null)} title={confirmAction.type === "change_plan" ? "Change User Plan" : "Confirm Action"}>
          <div className="flex flex-col gap-4 p-2">
            {confirmAction.type === "change_plan" ? (
              <>
                <p className="text-sm text-white">Select a new plan for <strong>{confirmAction.user.name}</strong>.</p>
                <Select label="New Plan" value={newPlan} onChange={(e) => setNewPlan(e.target.value as any)} className="bg-valtier-bg border-valtier-border text-white">
                  <option value="free">Explorer (Free)</option>
                  <option value="pro">Pro ($49/mo)</option>
                  <option value="enterprise">Enterprise</option>
                </Select>
              </>
            ) : (
              <p className="text-sm text-white">
                Are you sure you want to {confirmAction.type} <strong>{confirmAction.user.name}</strong>?
                {confirmAction.type === "delete" && <span className="block mt-2 text-valtier-rose font-bold">This action cannot be undone.</span>}
              </p>
            )}
            
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setConfirmAction(null)} className="px-4 py-2 rounded-lg font-bold text-valtier-muted hover:text-white transition-colors">Cancel</button>
              <button onClick={handleAction} className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${confirmAction.type === 'delete' ? 'bg-valtier-rose hover:bg-valtier-rose/80' : 'bg-valtier-accent hover:bg-valtier-accent-hover'}`}>
                Confirm
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
