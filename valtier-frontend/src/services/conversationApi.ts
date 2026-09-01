import type { Conversation, ConversationMessage } from "../types";
import { apiFetch } from "./client";

// Mirrors backend app/agents/schemas.py AgentResult.model_dump() — one
// entry per agent that ran on a given message.
export interface AgentResultRaw {
  agent: string;
  success: boolean;
  summary: string;
  data: Record<string, unknown>;
  errors: { agent: string; message: string }[];
}

interface MessageReadRaw {
  id: string;
  role: "user" | "agent";
  content: string;
  selected_agents: string[] | null;
  // Present on agent messages once the backend has been updated to expose
  // it (see app/schemas/agent.py MessageRead) — shape is
  // { results: AgentResultRaw[] }.
  agent_result_data: { results: AgentResultRaw[] } | null;
  created_at: string;
}

interface ConversationReadRaw {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface ConversationDetailRaw extends ConversationReadRaw {
  messages: MessageReadRaw[];
}

interface AgentRunResponseRaw {
  task_id: string;
  conversation_id: string;
  selected_agents: string[];
  status: string;
  result: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function titleCaseAgentName(id: string): string {
  return id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapMessage(raw: MessageReadRaw): ConversationMessage {
  return {
    id: raw.id,
    role: raw.role,
    content: raw.content,
    agentAttribution: raw.selected_agents?.map(titleCaseAgentName),
    timestamp: timeAgo(raw.created_at),
    agentResults: raw.agent_result_data?.results,
  };
}

function mapConversation(raw: ConversationDetailRaw): Conversation {
  const messages = raw.messages.map(mapMessage);
  const last = messages[messages.length - 1];
  return {
    id: raw.id,
    title: raw.title ?? "New conversation",
    lastMessage: last?.content ?? "No messages yet",
    updatedAgo: timeAgo(raw.updated_at),
    messages,
  };
}

// GET /api/v1/conversations, then GET /api/v1/conversations/{id} for each
// (the list endpoint doesn't include messages, so a preview needs the detail call).
export async function listConversations(): Promise<Conversation[]> {
  const list = await apiFetch<ConversationReadRaw[]>("/conversations");
  const details = await Promise.all(
    list.map((c) => apiFetch<ConversationDetailRaw>(`/conversations/${c.id}`))
  );
  return details.map(mapConversation);
}

// GET /api/v1/conversations/{id}
export async function getConversation(id: string): Promise<Conversation | undefined> {
  try {
    const raw = await apiFetch<ConversationDetailRaw>(`/conversations/${id}`);
    return mapConversation(raw);
  } catch {
    return undefined;
  }
}

/**
 * Send a message in a conversation. Under the hood this calls
 * POST /api/v1/agents/run with the conversation_id (or none, for a
 * brand-new conversation — the backend creates one and returns its id).
 * Valtier's orchestrator decides which agents run and the reply is
 * persisted server-side as part of the conversation history.
 */
export async function sendMessage(
  conversationId: string | null,
  content: string
): Promise<{ message: ConversationMessage; conversationId: string }> {
  const raw = await apiFetch<AgentRunResponseRaw>("/agents/run", {
    method: "POST",
    body: JSON.stringify({ task: content, conversation_id: conversationId }),
  });

  return {
    conversationId: raw.conversation_id,
    message: {
      id: raw.task_id,
      role: "agent",
      content: raw.result,
      agentAttribution: raw.selected_agents.map(titleCaseAgentName),
      timestamp: "Just now",
    },
  };
}
