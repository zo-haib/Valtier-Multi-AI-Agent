import { useState } from "react";
import { Bot, Settings2 } from "lucide-react";

const INITIAL_AGENTS = [
  { id: "researcher", name: "Researcher", model: "gpt-4o", temp: 0.2, tokens: 4096, cost: 2, status: "Active", enabled: true },
  { id: "coder", name: "Coder", model: "claude-3.5-sonnet", temp: 0.1, tokens: 8192, cost: 3, status: "Active", enabled: true },
  { id: "analyst", name: "Analyst", model: "gpt-4o", temp: 0.3, tokens: 4096, cost: 2, status: "Active", enabled: true },
  { id: "writer", name: "Writer", model: "gpt-4o-mini", temp: 0.7, tokens: 2048, cost: 1, status: "Active", enabled: true },
  { id: "manager", name: "Manager", model: "claude-3.5-sonnet", temp: 0.4, tokens: 4096, cost: 4, status: "Active", enabled: true },
  { id: "integrator", name: "Integrator", model: "gpt-4o", temp: 0.1, tokens: 4096, cost: 2, status: "Active", enabled: true },
];

export function AdminAgentsPage() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);

  const toggle = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <Bot className="w-8 h-8 text-valtier-accent" />
          AI Agents Configuration
        </h1>
        <p className="text-valtier-muted">Manage system prompts, models, and limits.</p>
      </div>

      <div className="glass rounded-2xl border border-valtier-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-valtier-surface/50 border-b border-valtier-border">
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Agent</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Model</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Temp</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Tokens</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Cost</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="border-b border-valtier-border/50 hover:bg-valtier-surface/30">
                <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-valtier-muted" /> {agent.name}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-valtier-accent">{agent.model}</td>
                <td className="px-6 py-4 text-sm text-white">{agent.temp}</td>
                <td className="px-6 py-4 text-sm text-white">{agent.tokens}</td>
                <td className="px-6 py-4 text-sm text-white">{agent.cost} cr</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${agent.enabled ? 'bg-valtier-emerald/20 text-valtier-emerald' : 'bg-valtier-surface text-valtier-muted'}`}>
                    {agent.enabled ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={agent.enabled} onChange={() => toggle(agent.id)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-valtier-bg rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-valtier-emerald"></div>
                  </label>
                  <button className="text-valtier-muted hover:text-white p-1">
                    <Settings2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
