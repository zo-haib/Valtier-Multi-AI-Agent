import { useState } from "react";
import { User, ShieldCheck, Bell, Sparkles, Building2, Key } from "lucide-react";
import { Input } from "../components/ui/Input";
import { cn } from "../lib/cn";
import { useToast } from "../components/ui/Toast";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai-preferences", label: "AI Preferences", icon: Sparkles },
  { id: "workspace", label: "Workspace", icon: Building2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsPage() {
  const { showToast } = useToast();
  const [active, setActive] = useState<TabId>("profile");

  function save() {
    showToast("Settings saved successfully.", "success");
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <User className="w-8 h-8 text-valtier-accent" />
          Settings
        </h1>
        <p className="text-valtier-muted">Manage your profile, security, and workspace preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <div className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col glass p-4 rounded-2xl border border-valtier-border h-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                active === tab.id 
                  ? "bg-valtier-accent/20 text-valtier-accent shadow-glow-sm" 
                  : "text-valtier-muted hover:bg-valtier-surface hover:text-white"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass p-8 rounded-2xl border border-valtier-border">
          {active === "profile" && (
            <div className="flex flex-col gap-6 max-w-xl">
              <h2 className="text-xl font-bold text-white mb-2">Profile Information</h2>
              <div className="flex items-center gap-6 mb-4">
                <div className="w-20 h-20 rounded-full bg-valtier-accent/20 border border-valtier-accent flex items-center justify-center text-2xl font-bold text-valtier-accent">
                  MZ
                </div>
                <button className="text-sm font-bold text-white bg-valtier-surface px-4 py-2 rounded-lg border border-valtier-border hover:border-valtier-muted transition-colors">
                  Upload Avatar
                </button>
              </div>
              <Input label="Full Name" defaultValue="Muhammad Zohaib" />
              <Input label="Email Address" type="email" defaultValue="muhammad@valtier.ai" />
              <button onClick={save} className="bg-valtier-accent hover:bg-valtier-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all w-fit shadow-glow-sm mt-2">
                Save Changes
              </button>
            </div>
          )}

          {active === "security" && (
            <div className="flex flex-col gap-8 max-w-xl">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
                <div className="flex flex-col gap-4">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <Input label="New Password" type="password" placeholder="••••••••" />
                  <button onClick={save} className="bg-valtier-surface hover:bg-valtier-border text-white px-6 py-2.5 rounded-xl font-bold transition-all border border-valtier-border w-fit mt-2">
                    Update Password
                  </button>
                </div>
              </div>
              
              <div className="border-t border-valtier-border pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold mb-1">Two-Factor Authentication</h3>
                    <p className="text-sm text-valtier-muted">Add an extra layer of security to your account.</p>
                  </div>
                  <button className="bg-valtier-emerald/20 text-valtier-emerald px-4 py-2 rounded-lg text-sm font-bold border border-valtier-emerald/30">
                    Enable 2FA
                  </button>
                </div>
              </div>

              <div className="border-t border-valtier-border pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold mb-1">Active Sessions</h3>
                    <p className="text-sm text-valtier-muted">2 devices currently signed in.</p>
                  </div>
                  <button className="bg-valtier-surface text-white px-4 py-2 rounded-lg text-sm font-bold border border-valtier-border hover:bg-valtier-border transition-colors">
                    Manage Sessions
                  </button>
                </div>
              </div>
            </div>
          )}

          {active === "api-keys" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">API Keys</h2>
                <p className="text-sm text-valtier-muted mb-6">Manage API keys to access Valtier's engine programmatically.</p>
              </div>
              <div className="bg-valtier-surface p-8 rounded-xl border border-dashed border-valtier-border text-center">
                <Key className="w-8 h-8 text-valtier-muted mx-auto mb-3 opacity-50" />
                <p className="text-white font-bold mb-1">No API keys generated</p>
                <p className="text-sm text-valtier-muted mb-4">Create a key to authenticate your applications.</p>
                <button className="bg-valtier-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-glow-sm">
                  Generate New Key
                </button>
              </div>
            </div>
          )}

          {active === "notifications" && (
            <div className="flex flex-col gap-6 max-w-xl">
              <h2 className="text-xl font-bold text-white mb-2">Email Notifications</h2>
              <div className="flex flex-col gap-4">
                {[
                  { label: "Mission Completions", desc: "Get notified when a workflow finishes" },
                  { label: "Security Alerts", desc: "Important security notifications about your account" },
                  { label: "Billing Updates", desc: "Invoices and subscription changes" },
                  { label: "Weekly Summary", desc: "AI workforce performance report" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-valtier-surface border border-valtier-border">
                    <div>
                      <div className="text-white font-bold text-sm mb-1">{item.label}</div>
                      <div className="text-xs text-valtier-muted">{item.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-valtier-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-valtier-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-valtier-accent border border-valtier-border"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "ai-preferences" && (
            <div className="flex flex-col gap-6 max-w-xl">
              <h2 className="text-xl font-bold text-white mb-2">AI Preferences</h2>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-valtier-muted uppercase tracking-wider">Response Tone</label>
                <select className="bg-valtier-bg border border-valtier-border text-white px-4 py-3 rounded-xl focus:outline-none focus:border-valtier-accent transition-colors">
                  <option>Concise & Direct</option>
                  <option>Detailed & Analytical</option>
                  <option>Executive Summary</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-valtier-surface border border-valtier-border mt-4">
                <div>
                  <div className="text-white font-bold text-sm mb-1">Auto-Contextualize</div>
                  <div className="text-xs text-valtier-muted max-w-sm">Allow agents to automatically search Enterprise Knowledge during missions.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-valtier-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-valtier-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-valtier-accent border border-valtier-border"></div>
                </label>
              </div>

              <button onClick={save} className="bg-valtier-accent hover:bg-valtier-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all w-fit shadow-glow-sm mt-2">
                Save Preferences
              </button>
            </div>
          )}

          {active === "workspace" && (
            <div className="flex flex-col gap-6 max-w-xl">
              <h2 className="text-xl font-bold text-white mb-2">Workspace Settings</h2>
              <Input label="Workspace Name" defaultValue="Valtier HQ" />
              <Input label="Workspace URL" defaultValue="valtier.ai/w/valtier-hq" disabled />
              <button onClick={save} className="bg-valtier-accent hover:bg-valtier-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all w-fit shadow-glow-sm mt-2">
                Update Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
