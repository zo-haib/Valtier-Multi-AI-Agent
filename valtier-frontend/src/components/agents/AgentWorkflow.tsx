import { motion } from "framer-motion";
import { Sparkles, ArrowDown, CheckCircle2 } from "lucide-react";
import type { AgentId, WorkflowStatus } from "../../types";
import { AGENT_ICONS } from "./AgentIcon";
import { getAgentById } from "../../data/agents";
import { cn } from "../../lib/cn";

export interface WorkflowNodeState {
  agentId: AgentId;
  status: WorkflowStatus;
}

const STATUS_LABEL: Record<WorkflowStatus, string> = {
  waiting: "Waiting",
  thinking: "Thinking",
  working: "Working",
  completed: "Completed",
  failed: "Failed",
};

function Connector() {
  return (
    <div className="flex justify-center py-1">
      <ArrowDown className="h-4 w-4 text-brand-dark/20" />
    </div>
  );
}

export function AgentWorkflow({
  request,
  nodes,
  finalResult,
}: {
  request: string;
  nodes: WorkflowNodeState[];
  finalResult?: string | null;
}) {
  return (
    <div className="flex flex-col items-stretch">
      {/* User request node */}
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-brand-dark/10 bg-brand-light px-5 py-4 text-center ">
        <span className="text-xs uppercase tracking-wide text-brand-dark/40">Your request</span>
        <p className="text-sm text-brand-dark/80">{request}</p>
      </div>
      <Connector />

      {/* Orchestrator node */}
      <div className="mx-auto flex items-center gap-2 rounded-full border border-brand-dark/15 bg-brand-dark/5 px-5 py-2.5 ">
        <Sparkles className="h-4 w-4 text-brand-dark/70" />
        <span className="text-sm font-medium">Orchestrator</span>
      </div>
      <Connector />

      {/* Agent nodes */}
      <div className="flex flex-col gap-2">
        {nodes.map((node, i) => {
          const agent = getAgentById(node.agentId);
          const Icon = AGENT_ICONS[node.agentId];
          if (!agent) return null;
          return (
            <div key={node.agentId}>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border px-5 py-3.5 ",
                  node.status === "completed" && "border-emerald-500/20 bg-emerald-500/5",
                  node.status === "failed" && "border-red-500/20 bg-red-500/5",
                  (node.status === "working" || node.status === "thinking") && "border-blue-500/30 bg-blue-500/5",
                  node.status === "waiting" && "border-brand-dark/10 bg-brand-light"
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-dark/10 bg-brand-light">
                  <Icon className="h-4 w-4 text-brand-dark/70" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-brand-dark/40">{STATUS_LABEL[node.status]}</p>
                </div>
                {node.status === "completed" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                {(node.status === "working" || node.status === "thinking") && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-400" />
                  </span>
                )}
              </motion.div>
              {i < nodes.length - 1 && <Connector />}
            </div>
          );
        })}
      </div>

      {finalResult !== undefined && (
        <>
          <Connector />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-md rounded-2xl border border-brand-dark/15 bg-brand-dark/5 px-5 py-4 "
          >
            <span className="mb-1.5 block text-xs uppercase tracking-wide text-brand-dark/40">Final result</span>
            {finalResult ? (
              <p className="text-sm text-brand-dark/80">{finalResult}</p>
            ) : (
              <p className="text-sm text-brand-dark/40">Waiting for agents to finish…</p>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
