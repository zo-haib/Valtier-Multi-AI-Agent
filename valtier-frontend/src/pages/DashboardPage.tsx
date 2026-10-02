import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Terminal, BookOpen, ChartArea, Clock3 } from "lucide-react";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/Feedback";
import { UsageBar } from "../components/ui/UsageBar";
import { listWorkflows } from "../services/agentApi";
import { getDashboardSummary, type DashboardSummary } from "../services/dashboardApi";
import type { Workflow } from "../types";
import { getAgentById } from "../data/agents";

const QUICK_ACTIONS = [
  { to: "/agents", icon: Bot, title: "Run Agent", description: "Give an AI specialist a task." },
  { to: "/missions", icon: Terminal, title: "Start Mission", description: "Coordinate multiple agents on a complex task." },
  { to: "/knowledge", icon: BookOpen, title: "Add Knowledge", description: "Upload data to your enterprise knowledge." },
  { to: "/analytics", icon: ChartArea, title: "View Analytics", description: "Monitor your workforce performance." },
];

type LoadState = "loading" | "success" | "error";

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryState, setSummaryState] = useState<LoadState>("loading");

  const [workflows, setWorkflows] = useState<Workflow[] | null>(null);
  const [workflowsState, setWorkflowsState] = useState<LoadState>("loading");

  function loadSummary() {
    setSummaryState("loading");
    getDashboardSummary()
      .then((data) => {
        setSummary(data);
        setSummaryState("success");
      })
      .catch(() => setSummaryState("error"));
  }

  function loadWorkflows() {
    setWorkflowsState("loading");
    listWorkflows()
      .then((data) => {
        setWorkflows(data);
        setWorkflowsState("success");
      })
      .catch(() => setWorkflowsState("error"));
  }

  useEffect(() => {
    loadSummary();
    loadWorkflows();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            {summaryState === "success" ? `Good morning, ${summary!.greetingName}` : "Good morning"}
          </h1>
          <p className="text-valtier-muted">Your AI workforce is ready for new missions.</p>
        </div>
        <div className="w-full md:w-72">
           {summaryState === "success" && summary ? (
             <UsageBar
               used={summary.usage.aiRequestsUsed}
               total={Math.max(summary.usage.aiRequestsLimit, 1)}
               label="AI Credits"
               resetsInDays={summary.usage.daysUntilReset}
             />
           ) : (
             <UsageBar used={0} total={1} label="AI Credits" resetsInDays={0} />
           )}
        </div>
      </div>

      {summaryState === "loading" && <LoadingState label="Loading dashboard…" />}
      {summaryState === "error" && (
        <ErrorState label="Couldn't load your dashboard stats." onRetry={loadSummary} />
      )}
      {summaryState === "success" && summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="glass p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-valtier-muted"><Bot className="w-4 h-4" /> Tasks Completed</div>
            <div className="text-2xl font-bold">{summary.stats.tasks.toLocaleString()}</div>
          </div>
          <div className="glass p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-valtier-muted"><Terminal className="w-4 h-4" /> Active Agents</div>
            <div className="text-2xl font-bold">{summary.stats.agents}</div>
          </div>
          <div className="glass p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-valtier-muted"><BookOpen className="w-4 h-4" /> Knowledge Sources</div>
            <div className="text-2xl font-bold">{summary.stats.knowledgeSources.toLocaleString()}</div>
          </div>
          <div className="glass p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-valtier-muted"><Clock3 className="w-4 h-4" /> Hours Automated</div>
            <div className="text-2xl font-bold">{summary.stats.hoursSaved.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.title} to={action.to}>
              <div className="glass hover:bg-valtier-surface p-5 rounded-2xl flex flex-col gap-4 h-full transition-all border border-valtier-border hover:border-valtier-accent/30 group">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-valtier-surface border border-valtier-border group-hover:scale-110 transition-transform">
                  <action.icon className="h-4.5 w-4.5 text-valtier-accent" />
                </span>
                <div>
                  <p className="font-bold text-white mb-1">{action.title}</p>
                  <p className="text-sm text-valtier-muted">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Active Missions</h2>
          <Link to="/missions" className="text-sm font-medium text-valtier-accent hover:text-valtier-accent-hover">
            View all
          </Link>
        </div>

        {workflowsState === "loading" && <LoadingState label="Loading missions…" />}
        {workflowsState === "error" && (
          <ErrorState label="Couldn't load recent missions." onRetry={loadWorkflows} />
        )}
        {workflowsState === "success" && workflows && workflows.length === 0 && (
          <EmptyState
            icon={Terminal}
            title="No active missions"
            description="Start a mission in the Command Center to see activity here."
          />
        )}
        {workflowsState === "success" && workflows && workflows.length > 0 && (
          <div className="flex flex-col gap-3">
            {workflows.map((wf) => (
              <div key={wf.id} className="glass hover:bg-valtier-surface p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {wf.agents.slice(0, 3).map((agentId) => {
                      const agent = getAgentById(agentId);
                      return agent ? (
                        <div key={agentId} className="w-8 h-8 rounded-full bg-valtier-accent/20 border-2 border-valtier-bg flex items-center justify-center text-xs font-bold text-valtier-accent">
                          {agent.name.charAt(0)}
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div>
                    <p className="font-bold text-white">{wf.title}</p>
                    <p className="text-sm text-valtier-muted">
                      {wf.agents.length} agent{wf.agents.length > 1 ? "s" : ""} · {wf.updatedAgo}
                    </p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 text-xs font-medium rounded-full ${wf.status === 'running' ? 'bg-valtier-accent/20 text-valtier-accent' : wf.status === 'completed' ? 'bg-valtier-emerald/20 text-valtier-emerald' : 'bg-valtier-surface text-valtier-muted'}`}>
                  {wf.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
