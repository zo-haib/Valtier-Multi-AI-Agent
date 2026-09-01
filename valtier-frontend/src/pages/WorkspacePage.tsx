import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Textarea } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { AgentWorkflow, type WorkflowNodeState } from "../components/agents/AgentWorkflow";
import type { WorkflowStatus } from "../types";
import { runAgentTask } from "../services/agentApi";
import { useToast } from "../components/ui/Toast";

const EXAMPLE_PROMPT =
  "Analyze our sales data, identify revenue problems, recommend a strategy, and create an implementation plan.";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function WorkspacePage() {
  const { showToast } = useToast();
  const [request, setRequest] = useState("");
  const [submittedRequest, setSubmittedRequest] = useState<string | null>(null);
  const [nodes, setNodes] = useState<WorkflowNodeState[]>([]);
  const [finalResult, setFinalResult] = useState<string | null | undefined>(undefined);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    if (!request.trim() || running) return;
    setRunning(true);
    setSubmittedRequest(request);
    setFinalResult(undefined);

    let selectedAgents;
    let result;
    try {
      ({ selectedAgents, result } = await runAgentTask(request));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Valtier couldn't complete that request.", "error");
      setSubmittedRequest(null);
      setRunning(false);
      return;
    }

    let currentNodes: WorkflowNodeState[] = selectedAgents.map((agentId) => ({
      agentId,
      status: "waiting" as WorkflowStatus,
    }));
    setNodes(currentNodes);

    for (let i = 0; i < selectedAgents.length; i++) {
      currentNodes = currentNodes.map((n, idx) =>
        idx === i ? { ...n, status: "thinking" } : n
      );
      setNodes([...currentNodes]);
      await sleep(400);

      currentNodes = currentNodes.map((n, idx) => (idx === i ? { ...n, status: "working" } : n));
      setNodes([...currentNodes]);
      await sleep(500);

      currentNodes = currentNodes.map((n, idx) => (idx === i ? { ...n, status: "completed" } : n));
      setNodes([...currentNodes]);
    }

    setFinalResult(result);
    setRunning(false);
  }

  function reset() {
    setSubmittedRequest(null);
    setNodes([]);
    setFinalResult(undefined);
    setRequest("");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Agent Workspace</h1>
        <p className="mt-1 text-brand-dark/50">Coordinate your entire AI workforce on a single complex task.</p>
      </div>

      {!submittedRequest ? (
        <GlassCard padding="lg" className="mx-auto w-full max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-brand-dark/60">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Tell Valtier what you need done…</span>
          </div>
          <Textarea
            rows={5}
            placeholder={EXAMPLE_PROMPT}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setRequest(EXAMPLE_PROMPT)}
              className="text-xs text-brand-dark/40 hover:text-brand-dark/70"
            >
              Use example
            </button>
            <Button onClick={handleRun} disabled={!request.trim() || running}>
              {running && <Loader2 className="h-4 w-4 animate-spin" />}
              Run workflow
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <GlassCard padding="lg">
            <AgentWorkflow request={submittedRequest} nodes={nodes} finalResult={finalResult} />
          </GlassCard>
          {!running && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={reset}>
                Start a new workflow
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
