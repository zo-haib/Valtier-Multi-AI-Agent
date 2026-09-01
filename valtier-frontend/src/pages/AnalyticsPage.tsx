import { useEffect, useState } from "react";
import { Bot, Clock3, TrendingUp, CheckCircle2 } from "lucide-react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { GlassCard } from "../components/ui/GlassCard";
import { StatCard } from "../components/ui/StatCard";
import { LoadingState } from "../components/ui/Feedback";
import { getAnalyticsOverview, type AnalyticsOverview } from "../services/analyticsApi";

const CHART_TOOLTIP_STYLE = {
  background: "rgba(11,11,11,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "12px",
};

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    getAnalyticsOverview().then(setData);
  }, []);

  if (!data) return <LoadingState label="Loading analytics…" />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-brand-dark/50">Enterprise-wide visibility into your AI workforce.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="AI Tasks" value={data.aiTasks.toLocaleString()} icon={Bot} />
        <StatCard label="Automation Hours" value={data.automationHours.toLocaleString()} icon={Clock3} />
        <StatCard label="Success Rate" value={`${data.successRate}%`} icon={CheckCircle2} />
        <StatCard label="Active Agents" value={data.activeAgents} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard padding="lg">
          <h2 className="mb-4 text-sm font-medium text-brand-dark/60">Tasks over time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.tasksOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />
              <Line type="monotone" dataKey="value" stroke="rgba(255,255,255,0.8)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard padding="lg">
          <h2 className="mb-4 text-sm font-medium text-brand-dark/60">Usage by agent</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.usageByAgent} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="value" fill="rgba(255,255,255,0.7)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
