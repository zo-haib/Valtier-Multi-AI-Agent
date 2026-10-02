import { useEffect, useState } from "react";
import { Sparkles, ListChecks, Mail } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { StatCard } from "../components/ui/StatCard";
import { LoadingState, EmptyState } from "../components/ui/Feedback";
import { listSalesStrategies } from "../services/agentInsightsApi";
import type { SalesStrategyEntry } from "../types";

export function SalesPage() {
  const [strategies, setStrategies] = useState<SalesStrategyEntry[] | null>(null);

  useEffect(() => {
    listSalesStrategies().then(setStrategies);
  }, []);

  const totalActions = strategies?.reduce((sum, s) => sum + s.prioritizedActions.length, 0) ?? 0;
  const withDraftEmail = strategies?.filter((s) => s.draftEmail).length ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Sales Intelligence</h1>
        <p className="mt-1 text-brand-dark/50">Strategy and outreach drafted by your Sales Agent.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Strategies Generated" value={strategies?.length ?? "—"} icon={Sparkles} />
        <StatCard label="Prioritized Actions" value={totalActions} icon={ListChecks} />
        <StatCard label="Draft Emails Ready" value={withDraftEmail} icon={Mail} />
      </div>

      {!strategies ? (
        <LoadingState label="Loading sales strategies…" />
      ) : strategies.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No sales strategies yet"
          description="Ask the Sales Agent about a lead, market, or campaign and its strategy will show up here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {strategies.map((strategy) => (
            <GlassCard key={strategy.id} padding="lg" className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-brand-dark/40">{strategy.sourceConversationTitle}</p>
                  <p className="mt-1 text-sm text-brand-dark/80">{strategy.summary}</p>
                </div>
                <span className="shrink-0 text-xs text-brand-dark/40">{strategy.updatedAgo}</span>
              </div>

              {strategy.prioritizedActions.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-dark/40">
                    Prioritized actions
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {strategy.prioritizedActions.map((action, i) => (
                      <li key={i} className="flex gap-2 text-sm text-brand-dark/70">
                        <span className="text-brand-dark/30">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {strategy.draftEmail && (
                <div className="rounded-xl border border-brand-dark/10 bg-brand-light p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-brand-dark/40">
                    <Mail className="h-3.5 w-3.5" /> Draft outreach email
                  </p>
                  <p className="whitespace-pre-line text-sm text-brand-dark/70">{strategy.draftEmail}</p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
