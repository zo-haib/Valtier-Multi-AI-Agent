import { apiFetch } from "./client";
import type { Project, Task } from "../types";

interface TaskRaw {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "done" | "blocked";
  due_date?: string | null;
  assigned_agent_id?: string | null;
  milestone?: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectRaw {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  status: "on_track" | "at_risk" | "completed" | "paused";
  deadline?: string | null;
  created_at: string;
  updated_at: string;
  tasks?: TaskRaw[];
}

function mapTask(raw: TaskRaw): Task {
  return {
    id: raw.id,
    projectId: raw.project_id,
    title: raw.title,
    description: raw.description ?? undefined,
    status: raw.status,
    dueDate: raw.due_date ?? undefined,
    assignedAgentId: raw.assigned_agent_id ?? undefined,
    milestone: raw.milestone ?? undefined,
    createdAt: raw.created_at,
  };
}

function mapProject(raw: ProjectRaw): Project {
  const tasks = (raw.tasks ?? []).map(mapTask);
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);
  const statusMap: Record<ProjectRaw["status"], Project["status"]> = {
    on_track: "on-track",
    at_risk: "at-risk",
    completed: "completed",
    paused: "at-risk",
  };

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? undefined,
    progress,
    agents: [],
    tasks,
    deadline: raw.deadline ? new Date(raw.deadline).toLocaleDateString() : "—",
    status: statusMap[raw.status] ?? "on-track",
  };
}

export async function listProjects(): Promise<Project[]> {
  const raw = await apiFetch<ProjectRaw[]>("/projects");
  return raw.map(mapProject);
}

export async function getProject(id: string): Promise<Project> {
  const raw = await apiFetch<ProjectRaw>(`/projects/${id}`);
  return mapProject(raw);
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const raw = await apiFetch<ProjectRaw>("/projects", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
  return mapProject(raw);
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.status !== undefined) {
    payload.status = updates.status.replace("-", "_");
  }
  const raw = await apiFetch<ProjectRaw>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapProject(raw);
}

export async function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/projects/${id}`, { method: "DELETE" });
}

export async function createTask(projectId: string, task: Partial<Task>): Promise<Task> {
  const raw = await apiFetch<TaskRaw>(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.dueDate,
      assigned_agent_id: task.assignedAgentId,
      milestone: task.milestone,
    }),
  });
  return mapTask(raw);
}

export async function updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
  const raw = await apiFetch<TaskRaw>(`/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: updates.title,
      description: updates.description,
      status: updates.status,
      due_date: updates.dueDate,
      assigned_agent_id: updates.assignedAgentId,
      milestone: updates.milestone,
    }),
  });
  return mapTask(raw);
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
}
