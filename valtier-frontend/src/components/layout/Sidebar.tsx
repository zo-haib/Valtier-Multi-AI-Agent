import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Bot,
  LayoutList,
  MessagesSquare,
  BookOpen,
  BrainCircuit,
  FolderKanban,
  ChartNoAxesCombined,
  ShieldCheck,
  FileText,
  TrendingUp,
  CreditCard,
  Settings,
  LogOut,
  Triangle,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/Feedback";
import { getCurrentUser, logout } from "../../services/authApi";

const NAV_SECTIONS = [
  {
    label: null,
    items: [{ to: "/dashboard", label: "Overview", icon: LayoutGrid }],
  },
  {
    label: "Workforce",
    items: [
      { to: "/agents", label: "Agents", icon: Bot },
      { to: "/workspace", label: "Workspace", icon: LayoutList },
      { to: "/conversations", label: "Conversations", icon: MessagesSquare },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { to: "/knowledge", label: "Knowledge", icon: BookOpen },
      { to: "/memory", label: "Memory", icon: BrainCircuit },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/projects", label: "Projects", icon: FolderKanban },
      { to: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
      { to: "/security", label: "Security", icon: ShieldCheck },
      { to: "/requirements", label: "Requirements", icon: FileText },
      { to: "/sales", label: "Sales", icon: TrendingUp },
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
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-brand-dark/10 bg-brand-cream">
      <div className="flex items-center gap-2 px-6 py-6">
        <Triangle className="h-5 w-5 text-brand-dark fill-brand-dark" />
        <span className="text-lg tracking-tight font-helvetica-neue">Valtier</span>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-5">
            {section.label && (
              <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-brand-dark/40">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-brand-dark/[0.06] text-brand-dark"
                        : "text-brand-dark/60 hover:bg-brand-dark/[0.04] hover:text-brand-dark"
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

      <div className="flex items-center gap-3 border-t border-brand-dark/10 px-4 py-4">
        <Avatar name={user.fullName || "Valtier User"} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.fullName || "Valtier User"}</p>
          <p className="text-xs text-brand-dark/40">Pro Plan</p>
        </div>
        <button
          onClick={handleLogout}
          title="Log out"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-dark/40 transition-colors hover:bg-brand-dark/[0.06] hover:text-brand-dark"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
