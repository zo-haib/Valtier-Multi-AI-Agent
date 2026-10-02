import type { Agent } from "../types";

export const agents: Agent[] = [
  {
    id: "project-management",
    name: "Project Management",
    description: "Turn ideas into structured execution plans.",
    capabilities: ["Project planning", "Task breakdown", "Milestones", "Dependencies", "Timelines", "Prioritization"],
    status: "ready",
    tasksCompleted: 312,
    successRate: 97,
  },
  {
    id: "data-processing",
    name: "Data Processing",
    description: "Transform messy business data into usable intelligence.",
    capabilities: ["Data cleaning", "CSV processing", "Data transformation", "Data summaries", "Data preparation"],
    status: "ready",
    tasksCompleted: 268,
    successRate: 98,
  },
  {
    id: "security",
    name: "Security",
    description: "Identify risks before they become problems.",
    capabilities: ["Security analysis", "Risk detection", "Architecture review", "Security recommendations", "Compliance checks"],
    status: "ready",
    tasksCompleted: 154,
    successRate: 99,
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Turn business data into actionable insights.",
    capabilities: ["Trend analysis", "Pattern detection", "KPIs", "Forecasting", "Business insights"],
    status: "ready",
    tasksCompleted: 401,
    successRate: 96,
  },
  {
    id: "requirements",
    name: "Requirements",
    description: "Convert business ideas into precise product requirements.",
    capabilities: ["Requirements extraction", "User stories", "Acceptance criteria", "Functional requirements", "Non-functional requirements"],
    status: "ready",
    tasksCompleted: 189,
    successRate: 95,
  },
  {
    id: "sales",
    name: "Sales",
    description: "Help your sales team research, prioritize, and convert.",
    capabilities: ["Lead analysis", "Lead prioritization", "Sales strategy", "Customer profiles", "Sales emails"],
    status: "ready",
    tasksCompleted: 227,
    successRate: 94,
  },
];

export const getAgentById = (id: string) => agents.find((a) => a.id === id);
