import { delay } from "./client";

export interface AnalyticsSeriesPoint {
  label: string;
  value: number;
}

export interface AnalyticsOverview {
  aiTasks: number;
  automationHours: number;
  successRate: number;
  activeAgents: number;
  tasksOverTime: AnalyticsSeriesPoint[];
  usageByAgent: AnalyticsSeriesPoint[];
}

// Mirrors an aggregate analytics endpoint the FastAPI backend would expose.
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return delay(
    {
      aiTasks: 8421,
      automationHours: 1834,
      successRate: 96.4,
      activeAgents: 6,
      tasksOverTime: [
        { label: "Mon", value: 820 },
        { label: "Tue", value: 932 },
        { label: "Wed", value: 1105 },
        { label: "Thu", value: 980 },
        { label: "Fri", value: 1240 },
        { label: "Sat", value: 610 },
        { label: "Sun", value: 540 },
      ],
      usageByAgent: [
        { label: "Analytics", value: 401 },
        { label: "Project Mgmt", value: 312 },
        { label: "Data Processing", value: 268 },
        { label: "Sales", value: 227 },
        { label: "Requirements", value: 189 },
        { label: "Security", value: 154 },
      ],
    },
    400
  );
}
