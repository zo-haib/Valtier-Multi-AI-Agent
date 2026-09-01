import type {
  AdminSubscription,
  AdminUser,
  AuditLogEntry,
  Conversation,
  KnowledgeDocument,
  MemoryEntry,
  PlanFeature,
  Project,
  Workflow,
} from "../types";

export const workflows: Workflow[] = [
  { id: "wf-1", title: "Sales Analysis & Revenue Plan", agents: ["data-processing", "analytics", "sales", "project-management"], status: "completed", updatedAgo: "8 min ago" },
  { id: "wf-2", title: "Security Architecture Review", agents: ["security"], status: "completed", updatedAgo: "21 min ago" },
  { id: "wf-3", title: "Q4 Product Requirements", agents: ["requirements", "project-management"], status: "running", updatedAgo: "just now" },
  { id: "wf-4", title: "Customer Data Cleanup", agents: ["data-processing"], status: "waiting", updatedAgo: "1 hr ago" },
  { id: "wf-5", title: "Enterprise Lead Scoring", agents: ["sales", "analytics"], status: "failed", updatedAgo: "3 hr ago" },
];

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Q3 Sales Performance",
    lastMessage: "I'll coordinate the Data Processing, Analytics, and Sales agents...",
    updatedAgo: "8 min ago",
    messages: [
      { id: "m1", role: "user", content: "Analyze our Q3 sales performance.", timestamp: "10:02 AM" },
      {
        id: "m2",
        role: "agent",
        content:
          "I'll coordinate the Data Processing, Analytics, and Sales agents to pull this together. Data Processing is cleaning the Q3 dataset now, Analytics will surface the trends, and Sales will translate that into next steps.",
        agentAttribution: ["Data Processing", "Analytics", "Sales"],
        timestamp: "10:02 AM",
      },
      {
        id: "m3",
        role: "agent",
        content:
          "Q3 revenue grew 12% quarter-over-quarter, driven mostly by the East region. Renewal rate dipped slightly (-3%) in the SMB segment — worth a closer look before Q4 planning.",
        agentAttribution: ["Analytics"],
        timestamp: "10:03 AM",
      },
    ],
  },
  {
    id: "conv-2",
    title: "Security review for customer portal",
    lastMessage: "Three findings, none critical — details below.",
    updatedAgo: "1 hr ago",
    messages: [
      { id: "m1", role: "user", content: "Review this application's architecture for security problems.", timestamp: "Yesterday" },
      {
        id: "m2",
        role: "agent",
        content: "Three findings, none critical — details below. The most notable is a shared API key used across integrations.",
        agentAttribution: ["Security"],
        timestamp: "Yesterday",
      },
    ],
  },
  {
    id: "conv-3",
    title: "Recruitment platform plan",
    lastMessage: "Here's the structured requirements and an execution plan.",
    updatedAgo: "2 days ago",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Build a platform where companies can upload resumes and automatically rank candidates.",
        timestamp: "Mon",
      },
      {
        id: "m2",
        role: "agent",
        content: "Here's the structured requirements and an execution plan, broken into functional and non-functional requirements with a phased delivery timeline.",
        agentAttribution: ["Requirements", "Project Management"],
        timestamp: "Mon",
      },
    ],
  },
];

export const knowledgeDocuments: KnowledgeDocument[] = [
  { id: "doc-1", name: "Company Handbook.pdf", type: "PDF", chunks: 184, addedAgo: "Today", status: "ready" },
  { id: "doc-2", name: "Security Policy.docx", type: "DOCX", chunks: 76, addedAgo: "Today", status: "ready" },
  { id: "doc-3", name: "Q3 Sales Export.csv", type: "CSV", chunks: 412, addedAgo: "2 days ago", status: "ready" },
  { id: "doc-4", name: "Vendor Agreement.pdf", type: "PDF", chunks: 0, addedAgo: "3 days ago", status: "processing" },
  { id: "doc-5", name: "Legacy Notes.txt", type: "TXT", chunks: 0, addedAgo: "1 week ago", status: "failed" },
];

export const memoryEntries: MemoryEntry[] = [
  { id: "mem-1", category: "Business Context", content: "The company prioritizes enterprise clients over SMB.", source: "Conversation", createdAt: "Aug 16, 2026" },
  { id: "mem-2", category: "User Preferences", content: "Prefers concise reports with bullet-point summaries.", source: "Conversation", createdAt: "Aug 15, 2026" },
  { id: "mem-3", category: "Projects", content: "Enterprise Recruitment Platform targets a Q1 launch.", source: "Workflow", createdAt: "Aug 14, 2026" },
  { id: "mem-4", category: "Decisions", content: "Chose Argon2 over bcrypt for password hashing.", source: "Conversation", createdAt: "Aug 12, 2026" },
  { id: "mem-5", category: "Important Facts", content: "Primary market is mid-size HR teams (50-500 employees).", source: "Conversation", createdAt: "Aug 10, 2026" },
];

export const projects: Project[] = [
  { id: "proj-1", name: "Enterprise Recruitment Platform", progress: 68, agents: ["requirements", "project-management", "security"], tasks: { total: 42, completed: 29 }, deadline: "Mar 15, 2027", status: "on-track" },
  { id: "proj-2", name: "Customer Data Warehouse Migration", progress: 34, agents: ["data-processing", "security"], tasks: { total: 30, completed: 10 }, deadline: "Feb 01, 2027", status: "at-risk" },
  { id: "proj-3", name: "Q4 Revenue Growth Initiative", progress: 100, agents: ["analytics", "sales"], tasks: { total: 18, completed: 18 }, deadline: "Dec 31, 2026", status: "completed" },
];

// Security risks, requirement items, and leads used to be hardcoded here.
// They're now derived from real conversation history — see
// services/agentInsightsApi.ts — so those fixtures were removed rather
// than left to rot unused.

export const plans: PlanFeature[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["20 AI tasks / month", "5 documents", "Basic agents"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: ["500 AI tasks / month", "100 documents", "All agents", "RAG", "Memory", "Advanced analytics"],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: null,
    yearlyPrice: null,
    features: ["High usage limits", "Advanced security", "Priority processing", "Enterprise support"],
  },
];

export const adminUsers: AdminUser[] = [
  { id: "u-1", name: "Muhammad Zohaib", email: "muhammad@valtier.ai", role: "admin", plan: "enterprise", status: "active", joinedAgo: "6 months ago" },
  { id: "u-2", name: "Dana Kim", email: "dana@acmecorp.com", role: "user", plan: "pro", status: "active", joinedAgo: "3 months ago" },
  { id: "u-3", name: "Raj Patel", email: "raj@nimbushealth.com", role: "user", plan: "pro", status: "active", joinedAgo: "2 months ago" },
  { id: "u-4", name: "Maria Chen", email: "maria@fieldstone.com", role: "user", plan: "free", status: "active", joinedAgo: "1 month ago" },
  { id: "u-5", name: "Tom Ericsson", email: "tom@brightline.com", role: "user", plan: "enterprise", status: "suspended", joinedAgo: "5 months ago" },
];

export const adminSubscriptions: AdminSubscription[] = [
  { id: "sub-1", customer: "Acme Corp", plan: "pro", billing: "monthly", amount: 29, status: "active", renewalDate: "Sep 12, 2026" },
  { id: "sub-2", customer: "Nimbus Health", plan: "pro", billing: "yearly", amount: 290, status: "active", renewalDate: "Jan 04, 2027" },
  { id: "sub-3", customer: "Brightline Retail", plan: "enterprise", billing: "yearly", amount: 1990, status: "active", renewalDate: "Nov 20, 2026" },
  { id: "sub-4", customer: "Cobalt Systems", plan: "pro", billing: "monthly", amount: 29, status: "past_due", renewalDate: "Aug 02, 2026" },
  { id: "sub-5", customer: "Fieldstone Logistics", plan: "free", billing: "none", amount: 0, status: "cancelled", renewalDate: "—" },
];

export const auditLogs: AuditLogEntry[] = [
  { id: "log-1", timestamp: "16:42", user: "Muhammad", action: "Started Analytics Agent", resource: "Agent Task", ip: "102.44.12.9", status: "success" },
  { id: "log-2", timestamp: "16:21", user: "Dana Kim", action: "Uploaded document", resource: "Company Handbook.pdf", ip: "88.212.4.61", status: "success" },
  { id: "log-3", timestamp: "15:58", user: "System", action: "Stripe webhook: payment failed", resource: "Subscription sub-4", ip: "—", status: "failed" },
  { id: "log-4", timestamp: "15:40", user: "Raj Patel", action: "Cancelled subscription", resource: "Subscription sub-2", ip: "41.99.3.20", status: "success" },
  { id: "log-5", timestamp: "14:12", user: "Muhammad", action: "Suspended user", resource: "Tom Ericsson", ip: "102.44.12.9", status: "success" },
];
