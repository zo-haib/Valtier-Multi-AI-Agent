import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Bot,
  BrainCircuit,
  FolderKanban,
  ChartNoAxesCombined,
  CreditCard,
  Settings,
  LogOut,
  Terminal,
  Database
} from "lucide-react";
import { cn } from "../../lib/cn";
import { getCurrentUser, logout } from "../../services/authApi";

const NAV_SECTIONS = [
  {
    label: null,
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutGrid }],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/agents", label: "AI Workforce", icon: Bot },
      { to: "/missions", label: "Command Center", icon: Terminal },
      { to: "/memory", label: "Memory", icon: BrainCircuit },
      { to: "/knowledge", label: "Knowledge", icon: Database },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/projects", label: "Projects", icon: FolderKanban },
      { to: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/subscriptions", label: "Billing", icon: CreditCard },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ fullName: "", email: "" });

  useEffect(() => {
    getCurrentUser().then((u) => setUser({ fullName: u.fullName, email: u.email }));
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-valtier-border bg-valtier-surface/80 backdrop-blur-md">
      <div className="flex items-center gap-2 px-6 py-6 border-b border-valtier-border/50">
        <div className="w-8 h-8 rounded bg-gradient-valtier flex items-center justify-center shadow-glow-sm">
          <Bot className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">VALTIER</span>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-6">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-6">
            {section.label && (
               <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-valtier-muted">
                 {section.label}
               </p>
            )}
            <div className="flex flex-col gap-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-valtier-accent/10 text-valtier-accent shadow-glow-sm border border-valtier-accent/20"
                        : "text-valtier-muted hover:bg-valtier-card hover:text-white"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-valtier-border bg-valtier-card/50 px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-valtier-accent/20 text-valtier-accent font-medium border border-valtier-accent/30">
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user.fullName || "Valtier User"}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-valtier-emerald"></span>
            <span className="text-xs text-valtier-muted">Pro Plan</span>
          </div>
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
