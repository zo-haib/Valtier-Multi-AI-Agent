import { useState } from "react";
import { Loader2, Sparkles, Terminal } from "lucide-react";
import { AutonomySelector, type AutonomyLevel } from "../components/agents/AutonomySelector";
import { runAgentTask } from "../services/agentApi";
import { useToast } from "../components/ui/Toast";
import { getAgentById } from "../data/agents";

const EXAMPLE_PROMPT =
  "Analyze our sales data, identify revenue problems, recommend a strategy, and create an implementation plan.";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type NodeStatus = "waiting" | "thinking" | "working" | "completed";

interface MissionNode {
  agentId: string;
  status: NodeStatus;
}

export function WorkspacePage() {
  const { showToast } = useToast();
  const [request, setRequest] = useState("");
  const [autonomy, setAutonomy] = useState<AutonomyLevel>("autonomous");
  const [submittedRequest, setSubmittedRequest] = useState<string | null>(null);
  const [nodes, setNodes] = useState<MissionNode[]>([]);
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
      ({ selectedAgents, result } = await runAgentTask(request, undefined, autonomy));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Valtier couldn't complete that mission.", "error");
      setSubmittedRequest(null);
      setRunning(false);
      return;
    }

    let currentNodes: MissionNode[] = selectedAgents.map((agentId) => ({
      agentId,
      status: "waiting",
    }));
    setNodes(currentNodes);

    for (let i = 0; i < selectedAgents.length; i++) {
      currentNodes = currentNodes.map((n, idx) =>
        idx === i ? { ...n, status: "thinking" } : n
      );
      setNodes([...currentNodes]);
      await sleep(600);

      currentNodes = currentNodes.map((n, idx) => (idx === i ? { ...n, status: "working" } : n));
      setNodes([...currentNodes]);
      await sleep(1000);

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
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Terminal className="w-8 h-8 text-valtier-accent" />
          Command Center
        </h1>
        <p className="mt-1 text-valtier-muted">Orchestrate your AI workforce for complex missions.</p>
      </div>

      {!submittedRequest ? (
        <div className="mx-auto w-full max-w-3xl glass p-8 rounded-2xl border border-valtier-border mt-8 shadow-glow-sm">
          <div className="mb-6">
            <label className="flex items-center gap-2 text-white font-bold mb-3 text-lg">
              <Sparkles className="h-5 w-5 text-valtier-accent" />
              What would you like your AI workforce to accomplish?
            </label>
            <textarea
              rows={4}
              className="w-full bg-valtier-bg border border-valtier-border rounded-xl p-4 text-white focus:outline-none focus:border-valtier-accent focus:ring-1 focus:ring-valtier-accent transition-all resize-none font-mono text-sm"
              placeholder={EXAMPLE_PROMPT}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-valtier-muted mb-3 uppercase tracking-wider">
              Level of Autonomy
            </label>
            <AutonomySelector value={autonomy} onChange={setAutonomy} />
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-valtier-border">
            <button
              onClick={() => setRequest(EXAMPLE_PROMPT)}
              className="text-sm font-medium text-valtier-muted hover:text-white transition-colors"
            >
              Load Example Mission
            </button>
            <button 
              onClick={handleRun} 
              disabled={!request.trim() || running}
              className="bg-valtier-accent hover:bg-valtier-accent-hover text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow-sm"
            >
              {running && <Loader2 className="h-4 w-4 animate-spin" />}
              Launch Mission
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="glass p-6 rounded-2xl border border-valtier-border">
             <div className="mb-6 pb-6 border-b border-valtier-border">
               <h3 className="text-sm font-bold text-valtier-muted uppercase tracking-wider mb-2">Mission Objective</h3>
               <p className="text-white font-mono text-sm bg-valtier-bg p-4 rounded-xl border border-valtier-border/50">{submittedRequest}</p>
             </div>

             <div className="grid sm:grid-cols-2 gap-4 mb-6">
               {nodes.map((node, i) => {
                 const agent = getAgentById(node.agentId);
                 if (!agent) return null;
                 return (
                   <div key={i} className={`p-4 rounded-xl border ${node.status === 'completed' ? 'border-valtier-emerald bg-valtier-emerald/5' : node.status === 'working' ? 'border-valtier-accent bg-valtier-accent/10 shadow-glow-sm' : 'border-valtier-border bg-valtier-surface'}`}>
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-valtier-card flex items-center justify-center border border-valtier-border">
                           {agent.icon && <agent.icon className="w-5 h-5 text-valtier-accent" />}
                         </div>
                         <div>
                           <div className="font-bold text-white">{agent.name}</div>
                           <div className="text-xs text-valtier-muted">{agent.role}</div>
                         </div>
                       </div>
                       <div className={`w-3 h-3 rounded-full ${node.status === 'completed' ? 'bg-valtier-emerald' : node.status === 'working' ? 'bg-valtier-accent animate-pulse-glow' : 'bg-valtier-border'}`}></div>
                     </div>
                     <div className="h-1.5 w-full bg-valtier-bg rounded-full overflow-hidden">
                       <div className={`h-full rounded-full transition-all duration-1000 ${node.status === 'completed' ? 'w-full bg-valtier-emerald' : node.status === 'working' ? 'w-2/3 bg-valtier-accent animate-pulse' : 'w-0'}`}></div>
                     </div>
                   </div>
                 );
               })}
             </div>

             {finalResult && (
               <div className="animate-fade-up">
                 <h3 className="text-sm font-bold text-valtier-emerald uppercase tracking-wider mb-3 flex items-center gap-2">
                   <Sparkles className="w-4 h-4" /> Mission Accomplished
                 </h3>
                 <div className="bg-valtier-bg border border-valtier-border rounded-xl p-6 text-white prose prose-invert max-w-none">
                   {/* In a real app we'd use ReactMarkdown here */}
                   <div dangerouslySetInnerHTML={{ __html: finalResult.replace(/\n/g, '<br/>') }} />
                 </div>
               </div>
             )}
          </div>
          
          {!running && (
            <div className="flex justify-center mt-4">
              <button onClick={reset} className="glass px-6 py-3 rounded-xl text-white font-medium hover:bg-valtier-surface transition-colors border border-valtier-border">
                Start New Mission
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
