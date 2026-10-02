import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles, BrainCircuit, Database } from "lucide-react";
import { getAgentById } from "../data/agents";
import { AgentStatusBadge } from "../components/ui/AgentStatusBadge";
import { EmptyState } from "../components/ui/Feedback";
import { runAgentTask } from "../services/agentApi";
import { useToast } from "../components/ui/Toast";

interface Execution {
  id: string;
  task: string;
  result: string;
  status: "completed";
}

export function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const { showToast } = useToast();
  const agent = getAgentById(agentId ?? "");
  const [task, setTask] = useState("");
  const [running, setRunning] = useState(false);
  const [executions, setExecutions] = useState<Execution[]>([]);

  if (!agent) {
    return (
      <EmptyState
        title="Agent not found"
        description="This agent doesn't exist."
        action={
          <Link to="/agents" className="bg-valtier-surface px-4 py-2 rounded-lg text-white font-medium border border-valtier-border">
            Back to workforce
          </Link>
        }
      />
    );
  }

  async function handleRun() {
    if (!task.trim()) return;
    setRunning(true);
    try {
      const result = await runAgentTask(task);
      setExecutions((prev) => [{ id: result.taskId, task, result: result.result, status: "completed" }, ...prev]);
      setTask("");
      showToast(`${agent!.name} completed the task.`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Valtier couldn't complete that task.", "error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <Link to="/agents" className="flex w-fit items-center gap-1.5 text-sm text-valtier-muted hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Workforce
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-6 glass p-8 rounded-2xl border border-valtier-border shadow-glow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-valtier-surface border border-valtier-border flex items-center justify-center text-valtier-accent shadow-glow-sm">
            {agent.icon ? <agent.icon className="w-10 h-10" /> : <Sparkles className="w-10 h-10" />}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-white">{agent.name}</h1>
              <AgentStatusBadge status={agent.status as "online" | "working" | "offline"} />
            </div>
            <p className="text-valtier-muted font-medium">{agent.role}</p>
            <p className="text-sm text-valtier-muted/80 mt-2 max-w-xl">{agent.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="glass p-6 rounded-2xl border border-valtier-border">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Sparkles className="h-5 w-5 text-valtier-accent" />
              Assign Task
            </h2>
            <textarea
              rows={4}
              className="w-full bg-valtier-bg border border-valtier-border rounded-xl p-4 text-white focus:outline-none focus:border-valtier-accent focus:ring-1 focus:ring-valtier-accent transition-all resize-none font-mono text-sm"
              placeholder={`e.g. "Draft an implementation plan based on the latest metrics..."`}
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleRun} 
                disabled={running || !task.trim()}
                className="bg-valtier-accent hover:bg-valtier-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-glow-sm"
              >
                {running && <Loader2 className="h-4 w-4 animate-spin" />}
                Execute Task
              </button>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold text-white">Execution History</h2>
            {executions.length === 0 ? (
              <div className="glass p-8 rounded-2xl border border-valtier-border text-center text-valtier-muted border-dashed">
                <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No executions yet. Assign a task above.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {executions.map((exec) => (
                  <div key={exec.id} className="glass p-5 rounded-2xl border border-valtier-border">
                    <p className="text-sm font-mono text-valtier-muted mb-3 pb-3 border-b border-valtier-border/50">{exec.task}</p>
                    <p className="text-sm text-white prose prose-invert">{exec.result}</p>
                    <div className="mt-4 flex justify-end">
                      <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-full bg-valtier-emerald/20 text-valtier-emerald uppercase">
                        {exec.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl border border-valtier-border">
            <h3 className="mb-4 text-sm font-bold text-valtier-muted uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Capabilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap) => (
                <span key={cap} className="rounded-lg bg-valtier-surface border border-valtier-border px-3 py-1.5 text-xs font-medium text-white shadow-sm">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-valtier-border">
            <h3 className="mb-4 text-sm font-bold text-valtier-muted uppercase tracking-wider">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-valtier-surface p-4 rounded-xl border border-valtier-border text-center">
                <p className="text-2xl font-bold text-white">{agent.tasksCompleted.toLocaleString()}</p>
                <p className="text-xs text-valtier-muted mt-1">Tasks</p>
              </div>
              <div className="bg-valtier-surface p-4 rounded-xl border border-valtier-border text-center">
                <p className="text-2xl font-bold text-valtier-emerald">{agent.successRate}%</p>
                <p className="text-xs text-valtier-muted mt-1">Success</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-valtier-border">
            <h3 className="mb-4 text-sm font-bold text-valtier-muted uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" /> Memory Access
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-valtier-muted">Long-term memories</span>
                <span className="font-bold text-white">412</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-valtier-muted">Recent context</span>
                <span className="font-bold text-white">45 docs</span>
              </div>
              <button className="w-full mt-2 bg-valtier-surface hover:bg-valtier-border transition-colors text-white py-2 rounded-lg text-xs font-bold border border-valtier-border">
                Manage Memory
              </button>
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl border border-valtier-border">
            <h3 className="mb-4 text-sm font-bold text-valtier-muted uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4" /> Knowledge Access
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-valtier-emerald"></div> Q3 Financial Reports
              </div>
              <div className="text-sm text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-valtier-emerald"></div> Marketing Assets 2024
              </div>
              <div className="text-sm text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-valtier-emerald"></div> Internal API Docs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
