export type AgentId =
  | "project-management"
  | "data-processing"
  | "security"
  | "analytics"
  | "requirements"
  | "sales";

export interface Agent {
  id: AgentId;
  name: string;
  description: string;
  capabilities: string[];
  status: "ready" | "working" | "offline";
  tasksCompleted: number;
  successRate: number;
}

export type WorkflowStatus = "waiting" | "thinking" | "working" | "completed" | "failed";

export interface WorkflowStep {
  agentId: AgentId;
  agentName: string;
  status: WorkflowStatus;
}

export interface Workflow {
  id: string;
  title: string;
  agents: AgentId[];
  status: "running" | "completed" | "failed" | "waiting";
  updatedAgo: string;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  agentAttribution?: string[];
  timestamp: string;
  // Raw per-agent structured output for this message (security findings,
  // requirements, sales strategy, etc.), when the backend captured any —
  // see services/conversationApi.ts AgentResultRaw.
  agentResults?: { agent: string; success: boolean; summary: string; data: Record<string, unknown> }[];
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAgo: string;
  messages: ConversationMessage[];
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "CSV";
  chunks: number;
  addedAgo: string;
  status: "ready" | "processing" | "failed";
}

export interface MemoryEntry {
  id: string;
  category: "User Preferences" | "Business Context" | "Projects" | "Decisions" | "Important Facts";
  content: string;
  source: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  progress: number;
  agents: AgentId[];
  tasks: { total: number; completed: number };
  deadline: string;
  status: "on-track" | "at-risk" | "completed";
}

// Real findings from the Security Agent's SecurityReport (see backend
// app/agents/schemas.py). There is no resolution-tracking workflow on the
// backend yet, so every finding surfaces as "open" until that exists —
// this is not a fabricated status, just the only one currently possible.
export interface SecurityRisk {
  id: string;
  title: string;
  severity: string;
  category: string;
  agent: string;
  status: "open";
  sourceConversationId: string;
  sourceConversationTitle: string;
}

// Real requirements from the Requirements Agent's RequirementsSpec. The
// backend has no draft/in-review/approved workflow, so no "status" field
// is invented here — each item just links back to the conversation that
// produced it.
export interface RequirementItem {
  id: string;
  text: string;
  priority: string;
  type: "functional" | "non-functional";
  sourceConversationId: string;
  sourceConversationTitle: string;
}

// The Sales Agent produces a SalesStrategy (summary + prioritized actions +
// an optional draft email) — there is no lead/company/contact/score concept
// anywhere in the backend. This replaces the old fabricated `Lead` shape
// with what the agent actually returns.
export interface SalesStrategyEntry {
  id: string;
  summary: string;
  prioritizedActions: string[];
  draftEmail: string | null;
  sourceConversationId: string;
  sourceConversationTitle: string;
  updatedAgo: string;
}

export interface PlanFeature {
  id: "free" | "pro" | "enterprise";
  name: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  features: string[];
  highlighted?: boolean;
  stripePriceIdMonthly?: string | null;
  stripePriceIdYearly?: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  plan: "free" | "pro" | "enterprise";
  status: "active" | "suspended";
  joinedAgo: string;
}

export interface AdminSubscription {
  id: string;
  customer: string;
  plan: "free" | "pro" | "enterprise";
  billing: "monthly" | "yearly" | "none";
  amount: number;
  status: "active" | "cancelled" | "past_due";
  renewalDate: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  status: "success" | "failed";
}

export interface StatDatum {
  label: string;
  value: string;
}
