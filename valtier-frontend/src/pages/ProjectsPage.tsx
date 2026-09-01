import { useEffect, useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { ProgressBar, LoadingState, EmptyState } from "../components/ui/Feedback";
import { StatusBadge } from "../components/ui/StatusBadge";
import { AgentIcon } from "../components/agents/AgentIcon";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { listProjects, createProject } from "../services/projectApi";
import type { Project } from "../types";
import { useToast } from "../components/ui/Toast";

export function ProjectsPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    listProjects().then(setProjects);
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    const project = await createProject(name);
    setProjects((prev) => [project, ...(prev ?? [])]);
    setModalOpen(false);
    setName("");
    showToast("Project created.", "success");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-1 text-brand-dark/50">Track execution across your AI-coordinated initiatives.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Create project
        </Button>
      </div>

      {!projects ? (
        <LoadingState label="Loading projects…" />
      ) : projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project to get started." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <GlassCard key={project.id} hover padding="lg" className="flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{project.name}</h3>
                <StatusBadge status={project.status} />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs text-brand-dark/40">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} />
              </div>

              <div className="flex items-center justify-between text-sm text-brand-dark/60">
                <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                <span>{project.deadline}</span>
              </div>

              <div className="flex items-center gap-1.5 border-t border-brand-dark/5 pt-4">
                {project.agents.map((agentId) => (
                  <AgentIcon key={agentId} agentId={agentId} size="sm" />
                ))}
                {project.agents.length === 0 && <span className="text-xs text-brand-dark/30">No agents assigned yet</span>}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create project">
        <div className="flex flex-col gap-4">
          <Input label="Project name" placeholder="e.g. Enterprise Onboarding Revamp" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={handleCreate} disabled={!name.trim()} className="w-full">
            Create project
          </Button>
        </div>
      </Modal>
    </div>
  );
}
