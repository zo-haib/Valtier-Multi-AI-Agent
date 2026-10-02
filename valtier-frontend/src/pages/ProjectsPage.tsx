import { useEffect, useState } from "react";
import { Plus, FolderKanban, LayoutGrid, List } from "lucide-react";
import { LoadingState, EmptyState } from "../components/ui/Feedback";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Modal } from "../components/ui/Modal";
import { Input, Textarea } from "../components/ui/Input";
import { listProjects, createProject, createTask } from "../services/projectApi";
import type { Project } from "../types";
import { useToast } from "../components/ui/Toast";

export function ProjectsPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  
  useEffect(() => {
    listProjects().then(setProjects).catch(() => showToast("Could not load projects.", "error"));
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      const project = await createProject(name, description);
      setProjects((prev) => [{...project, tasks: []}, ...(prev ?? [])]);
      setModalOpen(false);
      setName("");
      setDescription("");
      showToast("Project created.", "success");
    } catch (err) {
      showToast("Could not create project.", "error");
    }
  }

  async function handleCreateTask() {
    if (!taskTitle.trim() || !expandedProject) return;
    try {
      const newTask = await createTask(expandedProject, { title: taskTitle, status: "todo" });
      setProjects(
        (prev) =>
          prev?.map((p) => (p.id === expandedProject ? { ...p, tasks: [...p.tasks, newTask] } : p)) ?? null
      );
      setTaskModalOpen(false);
      setTaskTitle("");
      showToast("Task added to project.", "success");
    } catch {
      showToast("Could not create task.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2 mb-2">
            <FolderKanban className="w-8 h-8 text-valtier-accent" />
            Projects
          </h1>
          <p className="text-valtier-muted">Manage your AI-assisted initiatives and track progress.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-valtier-surface border border-valtier-border rounded-lg p-1 flex">
            <button 
              onClick={() => setView("grid")} 
              className={`p-1.5 rounded ${view === "grid" ? "bg-valtier-card text-white shadow-sm" : "text-valtier-muted hover:text-white"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView("list")} 
              className={`p-1.5 rounded ${view === "list" ? "bg-valtier-card text-white shadow-sm" : "text-valtier-muted hover:text-white"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-valtier-accent hover:bg-valtier-accent-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-glow-sm"
          >
            <Plus className="h-4 w-4" /> New Project
          </button>
        </div>
      </div>

      {!projects ? (
        <LoadingState label="Loading projects…" />
      ) : projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project to organize tasks." />
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {projects.map((project) => {
            const completedTasks = project.tasks.filter(t => t.status === "done").length;
            const totalTasks = project.tasks.length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
            
            return (
              <div key={project.id} className="glass rounded-2xl border border-valtier-border overflow-hidden transition-all group hover:border-valtier-accent/50">
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-white text-lg">{project.name}</h3>
                    <StatusBadge status={project.status as any} />
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-valtier-muted mb-6 line-clamp-2">{project.description}</p>
                  )}

                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-valtier-muted uppercase tracking-wider">
                      <span>Progress</span>
                      <span className="text-white">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-valtier-surface rounded-full overflow-hidden border border-valtier-border">
                      <div className="h-full bg-valtier-accent transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-valtier-muted">
                    <span>{completedTasks} of {totalTasks} tasks</span>
                    <span>Deadline: {project.deadline}</span>
                  </div>
                </div>

                {expandedProject === project.id && (
                  <div className="border-t border-valtier-border bg-valtier-surface/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-white text-sm uppercase tracking-wider">Tasks</h4>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setTaskModalOpen(true); }}
                        className="text-xs text-valtier-accent hover:text-valtier-accent-hover font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Task
                      </button>
                    </div>
                    
                    {project.tasks.length === 0 ? (
                      <p className="text-sm text-valtier-muted text-center py-4 border border-dashed border-valtier-border rounded-xl">No tasks yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {project.tasks.map(task => (
                          <div key={task.id} className="bg-valtier-bg p-3 rounded-lg border border-valtier-border flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={task.status === "done"} 
                              readOnly 
                              className="w-4 h-4 rounded border-valtier-border text-valtier-accent focus:ring-valtier-accent bg-valtier-surface"
                            />
                            <span className={`text-sm ${task.status === "done" ? "text-valtier-muted line-through" : "text-white"}`}>{task.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Project">
        <div className="flex flex-col gap-5 p-2">
          <Input 
            label="Project Name" 
            placeholder="e.g. Enterprise Q4 Review" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <Textarea 
            label="Description (Optional)" 
            placeholder="Brief overview of the project goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button 
            onClick={handleCreate} 
            disabled={!name.trim()} 
            className="w-full bg-valtier-accent hover:bg-valtier-accent-hover text-white py-3 rounded-xl font-bold transition-all shadow-glow-sm disabled:opacity-50"
          >
            Create Project
          </button>
        </div>
      </Modal>

      <Modal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Add Task">
        <div className="flex flex-col gap-5 p-2">
          <Input 
            label="Task Title" 
            placeholder="e.g. Generate quarterly summary report" 
            value={taskTitle} 
            onChange={(e) => setTaskTitle(e.target.value)} 
          />
          <button 
            onClick={handleCreateTask} 
            disabled={!taskTitle.trim()} 
            className="w-full bg-valtier-accent hover:bg-valtier-accent-hover text-white py-3 rounded-xl font-bold transition-all shadow-glow-sm disabled:opacity-50"
          >
            Add Task
          </button>
        </div>
      </Modal>
    </div>
  );
}
