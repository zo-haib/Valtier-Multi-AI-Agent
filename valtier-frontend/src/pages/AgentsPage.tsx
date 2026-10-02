import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { agents } from "../data/agents";
import { AgentStatusBadge } from "../components/ui/AgentStatusBadge";

export function AgentsPage() {
  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">AI Workforce</h1>
        <p className="text-valtier-muted">Specialized agents ready to collaborate and execute your missions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          // Mock stats for display
          const memoryCount = Math.floor(Math.random() * 500) + 100;
          const tasksCompleted = Math.floor(Math.random() * 2000) + 500;
          const successRate = (Math.random() * 5 + 94).toFixed(1);

          return (
            <Link key={agent.id} to={`/agents/${agent.id}`} className="group">
              <div className="glass p-6 rounded-2xl border border-valtier-border hover:border-valtier-accent/50 hover:shadow-glow-sm transition-all h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-valtier-surface border border-valtier-border flex items-center justify-center group-hover:scale-110 transition-transform">
                    {agent.icon && <agent.icon className="w-6 h-6 text-valtier-accent" />}
                  </div>
                  <AgentStatusBadge status={Math.random() > 0.7 ? "working" : "online"} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                <p className="text-sm font-medium text-valtier-muted mb-4">{agent.role}</p>
                <p className="text-sm text-valtier-muted/80 mb-6 flex-grow">{agent.description}</p>
                
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-valtier-border/50">
                  <div className="text-center">
                    <div className="text-xs text-valtier-muted mb-1">Memories</div>
                    <div className="text-sm font-bold text-white">{memoryCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-valtier-muted mb-1">Tasks</div>
                    <div className="text-sm font-bold text-white">{tasksCompleted}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-valtier-muted mb-1">Success</div>
                    <div className="text-sm font-bold text-valtier-emerald">{successRate}%</div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Add Agent Placeholder */}
        <button className="glass p-6 rounded-2xl border border-valtier-border border-dashed hover:border-valtier-accent/50 hover:bg-valtier-surface transition-all h-full flex flex-col items-center justify-center min-h-[300px] text-valtier-muted hover:text-white group">
          <div className="w-16 h-16 rounded-full bg-valtier-surface border border-valtier-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-1">Add Agent</h3>
          <p className="text-sm">Train a custom specialist</p>
          <div className="mt-4 px-3 py-1 bg-valtier-accent/20 text-valtier-accent text-xs font-bold rounded-full">COMING SOON</div>
        </button>
      </div>
    </div>
  );
}
