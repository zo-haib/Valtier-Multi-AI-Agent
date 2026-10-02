import { cn } from "../../lib/cn";

export type AgentStatus = "online" | "working" | "offline";

export function AgentStatusBadge({ status, className }: { status: AgentStatus; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", 
      status === "online" ? "bg-valtier-emerald/10 text-valtier-emerald border-valtier-emerald/20" :
      status === "working" ? "bg-valtier-accent/10 text-valtier-accent border-valtier-accent/20" :
      "bg-valtier-surface text-valtier-muted border-valtier-border",
      className
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === "online" ? "bg-valtier-emerald status-online" :
        status === "working" ? "bg-valtier-accent status-working" :
        "bg-valtier-muted status-offline"
      )}></span>
      <span className="capitalize">{status}</span>
    </div>
  );
}
