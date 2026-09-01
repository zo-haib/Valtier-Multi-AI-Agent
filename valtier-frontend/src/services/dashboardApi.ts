import { apiFetch } from "./client";

export interface DashboardSummary {
  greetingName: string;
  userEmail: string;
  plan: string;
  stats: {
    tasks: number;
    agents: number;
    knowledgeSources: number;
    hoursSaved: number;
  };
}

interface DashboardResponseRaw {
  user: { id: string; name: string; email: string; plan: string };
  stats: { tasks: number; agents: number; knowledge_sources: number; hours_saved: number };
  greeting_name: string;
}

// GET /api/v1/dashboard — real, authenticated user data and real
// database-derived stats. No client-side fallback to fake numbers:
// if this call fails, the page shows an error state instead.
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const raw = await apiFetch<DashboardResponseRaw>("/dashboard");
  return {
    greetingName: raw.greeting_name,
    userEmail: raw.user.email,
    plan: raw.user.plan,
    stats: {
      tasks: raw.stats.tasks,
      agents: raw.stats.agents,
      knowledgeSources: raw.stats.knowledge_sources,
      hoursSaved: raw.stats.hours_saved,
    },
  };
}
