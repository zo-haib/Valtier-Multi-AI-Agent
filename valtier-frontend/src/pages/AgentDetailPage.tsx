import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { getAgentById } from "../data/agents";
import { AgentIcon } from "../components/agents/AgentIcon";
import { GlassCard } from "../components/ui/GlassCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";
import { EmptyState } from "../components/ui/Feedback";
import { runAgentTask } from "../services/agentApi";
import type { AgentId } from "../types";
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
          <Link to="/agents">
            <Button variant="secondary">Back to agents</Button>
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
    <div className="flex flex-col gap-8">
      <Link to="/agents" className="flex w-fit items-center gap-1.5 text-sm text-brand-dark/50 hover:text-brand-dark">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to agents
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AgentIcon agentId={agent.id as AgentId} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-medium tracking-tight">{agent.name} Agent</h1>
              <StatusBadge status={agent.status} />
            </div>
            <p className="mt-1 text-brand-dark/50">{agent.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <GlassCard padding="lg">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
              <Sparkles className="h-4 w-4 text-brand-dark/50" />
              What should {agent.name} Agent analyze?
            </h2>
            <Textarea
              rows={4}
              placeholder={`e.g. "${
                agent.id === "analytics"
                  ? "Analyze our Q3 sales data and identify revenue trends."
                  : "Describe the task you'd like this agent to handle."
              }"`}
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleRun} disabled={running || !task.trim()}>
                {running && <Loader2 className="h-4 w-4 animate-spin" />}
                Run analysis
              </Button>
            </div>
          </GlassCard>

          <div>
            <h2 className="mb-3 text-lg font-medium">Recent executions</h2>
            {executions.length === 0 ? (
              <EmptyState title="No executions yet" description="Run a task above to see results here." />
            ) : (
              <div className="flex flex-col gap-3">
                {executions.map((exec) => (
                  <GlassCard key={exec.id} padding="md">
                    <p className="text-sm text-brand-dark/50">{exec.task}</p>
                    <p className="mt-2 text-sm text-brand-dark/80">{exec.result}</p>
                    <div className="mt-3">
                      <StatusBadge status={exec.status} />
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <GlassCard padding="lg">
            <h3 className="mb-3 text-sm font-medium text-brand-dark/60">Capabilities</h3>
            <div className="flex flex-wrap gap-1.5">
              {agent.capabilities.map((cap) => (
                <span key={cap} className="rounded-full border border-brand-dark/10 bg-brand-light px-2.5 py-1 text-xs text-brand-dark/60">
                  {cap}
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard padding="lg">
            <h3 className="mb-4 text-sm font-medium text-brand-dark/60">Performance</h3>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-helvetica-neue text-2xl">{agent.tasksCompleted}</p>
                <p className="text-xs text-brand-dark/40">Tasks completed</p>
              </div>
              <div>
                <p className="font-helvetica-neue text-2xl">{agent.successRate}%</p>
                <p className="text-xs text-brand-dark/40">Success rate</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
