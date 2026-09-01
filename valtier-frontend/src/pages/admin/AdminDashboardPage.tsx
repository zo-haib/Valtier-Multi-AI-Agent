import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CreditCard, Bot, DollarSign } from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { GlassCard } from "../../components/ui/GlassCard";
import { LoadingState } from "../../components/ui/Feedback";
import { getAdminDashboard, type AdminDashboardStats } from "../../services/adminApi";
import { useToast } from "../../components/ui/Toast";

export function AdminDashboardPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    getAdminDashboard().catch((err) => {
      showToast(err instanceof Error ? err.message : "Could not load dashboard.", "error");
      return null;
    }).then(setStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-brand-dark/15 bg-brand-dark/5 px-3 py-1 text-xs uppercase tracking-wide text-brand-dark/60">
          Admin
        </span>
      </div>
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Valtier Control Center</h1>
        <p className="mt-1 text-brand-dark/50">Platform-wide visibility and management.</p>
      </div>

      {!stats ? (
        <LoadingState label="Loading dashboard…" />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} />
          <StatCard label="Active Subscriptions" value={stats.activeSubscriptions.toLocaleString()} icon={CreditCard} />
          <StatCard label="AI Tasks Today" value={stats.aiTasksToday.toLocaleString()} icon={Bot} />
          <StatCard label="Revenue" value={`$${(stats.revenueCents / 100).toLocaleString()}`} icon={DollarSign} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/admin/users">
          <GlassCard hover padding="lg">
            <p className="font-medium">Manage users</p>
            <p className="mt-1 text-sm text-brand-dark/50">View, edit, suspend, or remove accounts.</p>
          </GlassCard>
        </Link>
        <Link to="/admin/subscriptions">
          <GlassCard hover padding="lg">
            <p className="font-medium">Subscriptions</p>
            <p className="mt-1 text-sm text-brand-dark/50">Review billing status across all customers.</p>
          </GlassCard>
        </Link>
        <Link to="/admin/audit-logs">
          <GlassCard hover padding="lg">
            <p className="font-medium">Audit logs</p>
            <p className="mt-1 text-sm text-brand-dark/50">Track every security-relevant action.</p>
          </GlassCard>
        </Link>
      </div>
    </div>
  );
}
