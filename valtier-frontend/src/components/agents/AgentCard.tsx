import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Agent } from "../../types";
import { GlassCard } from "../ui/GlassCard";
import { AgentIcon } from "./AgentIcon";
import { StatusBadge } from "../ui/StatusBadge";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link to={`/agents/${agent.id}`}>
      <GlassCard hover padding="lg" className="group flex h-full flex-col gap-5">
        <div className="flex items-start justify-between">
          <AgentIcon agentId={agent.id} size="lg" />
          <ArrowUpRight className="h-4 w-4 text-brand-dark/30 transition-all group-hover:text-brand-dark group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{agent.name}</h3>
            <StatusBadge status={agent.status} />
          </div>
          <p className="text-sm text-brand-dark/60">{agent.description}</p>
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <span key={cap} className="rounded-full border border-brand-dark/10 bg-brand-light px-2.5 py-1 text-xs text-brand-dark/60">
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="rounded-full border border-brand-dark/10 bg-brand-light px-2.5 py-1 text-xs text-brand-dark/40">
              +{agent.capabilities.length - 3}
            </span>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
