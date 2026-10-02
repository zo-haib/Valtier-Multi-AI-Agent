import { useState } from "react";
import { ToggleLeft } from "lucide-react";

const INITIAL_FLAGS = [
  { id: "rag", name: "RAG", desc: "Enterprise knowledge retrieval", enabled: true, updated: "2h ago" },
  { id: "memory", name: "Long-term Memory", desc: "Cross-session agent memory", enabled: true, updated: "1d ago" },
  { id: "marketplace", name: "Agent Marketplace", desc: "Third-party agents", enabled: false, updated: "5d ago" },
  { id: "automations", name: "Automations", desc: "Trigger-based workflows", enabled: false, updated: "1w ago" },
  { id: "integrations", name: "Integrations", desc: "Slack, Jira, Github", enabled: true, updated: "2w ago" },
  { id: "api", name: "API Access", desc: "Public REST API", enabled: true, updated: "1m ago" },
  { id: "sales_agent", name: "Sales Agent", desc: "Specialized sales agent", enabled: true, updated: "2m ago" },
  { id: "analytics_agent", name: "Analytics Agent", desc: "Data processing agent", enabled: true, updated: "2m ago" }
];

export function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState(INITIAL_FLAGS);

  const toggle = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <ToggleLeft className="w-8 h-8 text-valtier-accent" />
          Feature Flags
        </h1>
        <p className="text-valtier-muted">Safely rollout features across your infrastructure.</p>
      </div>

      <div className="glass rounded-2xl border border-valtier-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-valtier-surface/50 border-b border-valtier-border">
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Feature</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id} className="border-b border-valtier-border/50 hover:bg-valtier-surface/30">
                <td className="px-6 py-4 font-bold text-white">{flag.name}</td>
                <td className="px-6 py-4 text-sm text-valtier-muted">{flag.desc}</td>
                <td className="px-6 py-4 text-sm text-valtier-muted">{flag.updated}</td>
                <td className="px-6 py-4 text-right">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={flag.enabled} onChange={() => toggle(flag.id)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-valtier-bg rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-valtier-emerald"></div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
