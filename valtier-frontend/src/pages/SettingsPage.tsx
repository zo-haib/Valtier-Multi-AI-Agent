import { useState } from "react";
import { User, ShieldCheck, Bell, Sparkles, Building2 } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/cn";
import { useToast } from "../components/ui/Toast";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai-preferences", label: "AI Preferences", icon: Sparkles },
  { id: "workspace", label: "Workspace", icon: Building2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsPage() {
  const { showToast } = useToast();
  const [active, setActive] = useState<TabId>("profile");

  function save() {
    showToast("Settings saved.", "success");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-brand-dark/50">Manage your profile, security, and AI preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-colors",
                active === tab.id ? "bg-brand-dark/5 text-brand-dark" : "text-brand-dark/50 hover:bg-brand-light hover:text-brand-dark"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <GlassCard padding="lg">
          {active === "profile" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium">Profile</h2>
              <Input label="Name" defaultValue="Muhammad Zohaib" />
              <Input label="Email" type="email" defaultValue="muhammad@valtier.ai" />
              <Input label="Company" defaultValue="Valtier" />
              <Button onClick={save} className="mt-2 w-fit">Save changes</Button>
            </div>
          )}

          {active === "security" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-medium">Security</h2>
              <div className="flex flex-col gap-3">
                <Input label="Current password" type="password" placeholder="••••••••" />
                <Input label="New password" type="password" placeholder="••••••••" />
                <Button onClick={save} className="w-fit">Change password</Button>
              </div>
              <div className="flex items-center justify-between border-t border-brand-dark/10 pt-5">
                <div>
                  <p className="text-sm font-medium">Two-factor authentication</p>
                  <p className="text-sm text-brand-dark/40">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="secondary" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between border-t border-brand-dark/10 pt-5">
                <div>
                  <p className="text-sm font-medium">Active sessions</p>
                  <p className="text-sm text-brand-dark/40">2 devices currently signed in.</p>
                </div>
                <Button variant="secondary" size="sm">Manage</Button>
              </div>
            </div>
          )}

          {active === "notifications" && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-medium">Notifications</h2>
              {["Workflow completions", "Weekly summary", "Security alerts", "Billing updates"].map((label) => (
                <label key={label} className="flex items-center justify-between border-b border-brand-dark/5 pb-4 last:border-0">
                  <span className="text-sm text-brand-dark/70">{label}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-white/80" />
                </label>
              ))}
            </div>
          )}

          {active === "ai-preferences" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium">AI Preferences</h2>
              <label className="flex flex-col gap-1.5 text-sm text-brand-dark/60">
                Response tone
                <select className="rounded-xl border border-brand-dark/10 bg-brand-light px-4 py-2.5 text-brand-dark outline-none">
                  <option>Concise</option>
                  <option>Detailed</option>
                  <option>Executive summary</option>
                </select>
              </label>
              <label className="flex items-center justify-between border-t border-brand-dark/5 pt-4">
                <span className="text-sm text-brand-dark/70">Allow agents to use enterprise knowledge base automatically</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-white/80" />
              </label>
              <Button onClick={save} className="mt-2 w-fit">Save preferences</Button>
            </div>
          )}

          {active === "workspace" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium">Workspace</h2>
              <Input label="Workspace name" defaultValue="Valtier" />
              <Input label="Workspace URL" defaultValue="valtier.ai/w/valtier" disabled />
              <Button onClick={save} className="mt-2 w-fit">Save changes</Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
