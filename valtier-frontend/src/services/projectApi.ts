import { projects } from "../data/mock";
import type { Project } from "../types";
import { delay } from "./client";

export async function listProjects(): Promise<Project[]> {
  return delay(projects, 300);
}

export async function createProject(name: string): Promise<Project> {
  return delay(
    {
      id: `proj-${Date.now()}`,
      name,
      progress: 0,
      agents: [],
      tasks: { total: 0, completed: 0 },
      deadline: "TBD",
      status: "on-track",
    },
    500
  );
}
