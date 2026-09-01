import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid, Users, CreditCard, ScrollText, Menu, X, LogOut, Triangle } from "lucide-react";
import { cn } from "../../lib/cn";
import { getCurrentUser, logout } from "../../services/authApi";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
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
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-brand-dark text-brand-cream">
      <div className="flex items-center gap-2 px-6 py-6">
        <Triangle className="h-5 w-5 text-brand-cream fill-brand-cream" />
        <div>
          <p className="text-sm font-medium leading-none font-helvetica-neue">Valtier</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-brand-cream/50">Control Center</p>
        </div>
      </div>
      <nav className="flex-1 px-3">
        <div className="flex flex-col gap-0.5">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-white/10 text-brand-cream" : "text-brand-cream/60 hover:bg-white/5 hover:text-brand-cream"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-4">
        <div className="min-w-0">
          <p className="text-xs text-brand-cream/40">Signed in as</p>
          <p className="truncate text-sm font-medium">{userName || "Valtier Admin"}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Log out"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-cream/40 transition-colors hover:bg-white/5 hover:text-brand-cream"
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
    <div className="flex h-screen bg-brand-light text-brand-dark font-helvetica-neue">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full w-64">
            <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-brand-cream"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-brand-dark/10 bg-brand-dark px-4 py-3.5 text-brand-cream lg:hidden">
          <span className="text-sm font-medium">Valtier Control Center</span>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
