import { agents } from "../data/agents";
import { AgentCard } from "../components/agents/AgentCard";

export function AgentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Your AI Workforce</h1>
        <p className="mt-1 text-brand-dark/50">Six specialists. One coordinated intelligence.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
