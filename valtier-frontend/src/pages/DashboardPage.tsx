import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Workflow as WorkflowIcon, BookOpen, ChartArea, Clock3 } from "lucide-react";
import { StatCard } from "../components/ui/StatCard";
import { GlassCard } from "../components/ui/GlassCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { AgentIcon } from "../components/agents/AgentIcon";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/Feedback";
import { listWorkflows } from "../services/agentApi";
import { getDashboardSummary, type DashboardSummary } from "../services/dashboardApi";
import type { Workflow } from "../types";
import { getAgentById } from "../data/agents";

const QUICK_ACTIONS = [
  { to: "/workspace", icon: Bot, title: "Run an Agent", description: "Give an AI specialist a task." },
  { to: "/workspace", icon: WorkflowIcon, title: "Start Workflow", description: "Coordinate multiple agents on a complex task." },
  { to: "/knowledge", icon: BookOpen, title: "Ask Knowledge Base", description: "Search your enterprise knowledge." },
  { to: "/analytics", icon: ChartArea, title: "Analyze Data", description: "Upload data and generate insights." },
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
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
          {summaryState === "success" ? `Good morning, ${summary!.greetingName}` : "Good morning"}
        </h1>
        <p className="mt-1 text-brand-dark/50">Your AI workforce is ready to work.</p>
      </div>

      {summaryState === "loading" && <LoadingState label="Loading dashboard…" />}
      {summaryState === "error" && (
        <ErrorState label="Couldn't load your dashboard stats." onRetry={loadSummary} />
      )}
      {summaryState === "success" && summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="AI Tasks Completed" value={summary.stats.tasks.toLocaleString()} icon={Bot} />
          <StatCard label="Active Agents" value={summary.stats.agents} icon={WorkflowIcon} />
          <StatCard label="Knowledge Sources" value={summary.stats.knowledgeSources.toLocaleString()} icon={BookOpen} />
          <StatCard label="Hours Automated" value={summary.stats.hoursSaved.toLocaleString()} icon={Clock3} />
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-medium">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.title} to={action.to}>
              <GlassCard hover padding="md" className="flex h-full flex-col gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-dark/10 bg-brand-light">
                  <action.icon className="h-4.5 w-4.5 text-brand-dark/70" />
                </span>
                <div>
                  <p className="font-medium">{action.title}</p>
                  <p className="mt-1 text-sm text-brand-dark/50">{action.description}</p>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Active workflows</h2>
          <Link to="/workspace" className="text-sm text-brand-dark/50 hover:text-brand-dark">
            View all
          </Link>
        </div>

        {workflowsState === "loading" && <LoadingState label="Loading workflows…" />}
        {workflowsState === "error" && (
          <ErrorState label="Couldn't load recent workflows." onRetry={loadWorkflows} />
        )}
        {workflowsState === "success" && workflows && workflows.length === 0 && (
          <EmptyState
            icon={WorkflowIcon}
            title="No workflows yet"
            description="Run an agent or start a workspace conversation to see activity here."
          />
        )}
        {workflowsState === "success" && workflows && workflows.length > 0 && (
          <div className="flex flex-col gap-3">
            {workflows.map((wf) => (
              <GlassCard key={wf.id} hover padding="md" className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {wf.agents.slice(0, 3).map((agentId) => {
                      const agent = getAgentById(agentId);
                      return agent ? <AgentIcon key={agentId} agentId={agentId} size="sm" /> : null;
                    })}
                  </div>
                  <div>
                    <p className="font-medium">{wf.title}</p>
                    <p className="text-sm text-brand-dark/40">
                      {wf.agents.length} agent{wf.agents.length > 1 ? "s" : ""} · {wf.updatedAgo}
                    </p>
                  </div>
                </div>
                <StatusBadge status={wf.status} />
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
