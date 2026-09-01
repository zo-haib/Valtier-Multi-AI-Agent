import { agents } from "../data/agents";
import type { Agent, AgentId, Workflow } from "../types";
import { apiFetch, delay } from "./client";
import { listConversations } from "./conversationApi";

// Agents are static product metadata (icons, capability copy) — not
// something the backend stores, so this stays local rather than a
// network call.
export async function listAgents(): Promise<Agent[]> {
  return delay(agents, 200);
}

export async function getAgent(id: AgentId): Promise<Agent | undefined> {
  return delay(agents.find((a) => a.id === id), 150);
}

// Backend AgentName enum uses underscores (project_management); the
// frontend's AgentId type uses hyphens (project-management).
export function toBackendAgentId(id: AgentId): string {
  return id.replace(/-/g, "_");
}

export function fromBackendAgentId(id: string): AgentId {
  return id.replace(/_/g, "-") as AgentId;
}

// There's no dedicated "workflows" endpoint on the backend — a workflow
// here is just a past conversation, each one driven by an /agents/run
// call. We derive the dashboard's recent-workflow list from real
// conversation history instead of inventing a new backend concept.
export async function listWorkflows(): Promise<Workflow[]> {
  const conversations = await listConversations();
  return conversations.slice(0, 6).map((conv) => {
    const agentMessage = [...conv.messages].reverse().find((m) => m.role === "agent");
    const selectedAgents = (agentMessage?.agentAttribution ?? [])
      .map((label) => label.toLowerCase().replace(/\s+/g, "-"))
      .filter((id): id is AgentId => agents.some((a) => a.id === id));
    return {
      id: conv.id,
      title: conv.title,
      agents: selectedAgents,
      status: agentMessage ? "completed" : "waiting",
      updatedAgo: conv.updatedAgo,
    };
  });
}

export interface AgentRunResult {
  taskId: string;
  conversationId: string;
  selectedAgents: AgentId[];
  status: "completed" | "completed_with_errors";
  result: string;
}

interface AgentRunResponseRaw {
  task_id: string;
  conversation_id: string;
  selected_agents: string[];
  status: string;
  result: string;
}

// POST /api/v1/agents/run — the orchestrator (LangGraph, on the backend)
// decides which agents actually run. Requires the user to be signed in.
export async function runAgentTask(task: string, conversationId?: string): Promise<AgentRunResult> {
  const raw = await apiFetch<AgentRunResponseRaw>("/agents/run", {
    method: "POST",
    body: JSON.stringify({ task, conversation_id: conversationId ?? null }),
  });

  return {
    taskId: raw.task_id,
    conversationId: raw.conversation_id,
    selectedAgents: raw.selected_agents.map(fromBackendAgentId),
    status: raw.status === "completed" ? "completed" : "completed_with_errors",
    result: raw.result,
  };
}
