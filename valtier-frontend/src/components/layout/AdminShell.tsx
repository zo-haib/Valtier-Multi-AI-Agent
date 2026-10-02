import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid, Users, CreditCard, ScrollText, Menu, X, LogOut, Bot, Server, ToggleLeft, Banknote, Shield } from "lucide-react";
import { cn } from "../../lib/cn";
import { getCurrentUser, logout } from "../../services/authApi";

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/plans", label: "Plans & Pricing", icon: CreditCard },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/payments", label: "Payments", icon: Banknote },
  { to: "/admin/agents", label: "AI Agents", icon: Bot },
  { to: "/admin/feature-flags", label: "Feature Flags", icon: ToggleLeft },
  { to: "/admin/system-health", label: "System Health", icon: Server },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    getCurrentUser().then((u) => setUserName(u.fullName));
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-valtier-border bg-valtier-surface text-white">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-valtier-border">
        <div className="w-8 h-8 rounded bg-valtier-rose/20 border border-valtier-rose/30 flex items-center justify-center shadow-glow-sm">
          <Shield className="w-4 h-4 text-valtier-rose" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">Valtier</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-valtier-rose">Control Center</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        <div className="flex flex-col gap-1">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive ? "bg-valtier-rose/10 text-valtier-rose border border-valtier-rose/20 shadow-glow-sm" : "text-valtier-muted hover:bg-valtier-bg hover:text-white"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="flex items-center justify-between gap-2 border-t border-valtier-border px-4 py-4 bg-valtier-bg">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-valtier-muted">Admin User</p>
          <p className="truncate text-sm font-bold">{userName || "Valtier Admin"}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Log out"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-valtier-muted transition-colors hover:bg-valtier-surface hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function AdminShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-valtier-bg text-white font-sans">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-valtier-bg/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full w-64">
            <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-valtier-card border border-valtier-border text-valtier-muted hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-valtier-border bg-valtier-surface px-4 py-3.5 text-white lg:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-valtier-rose" />
            <span className="text-sm font-bold">Valtier Control Center</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-valtier-border bg-valtier-bg"
          >
            <Menu className="h-4 w-4 text-valtier-muted" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto bg-valtier-bg">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
