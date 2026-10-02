import {
  ClipboardCheck,
  Database,
  ShieldCheck,
  ChartNoAxesCombined,
  FileText,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { AgentId } from "../../types";
import { cn } from "../../lib/cn";

export const AGENT_ICONS: Record<AgentId, LucideIcon> = {
  "project-management": ClipboardCheck,
  "data-processing": Database,
  security: ShieldCheck,
  analytics: ChartNoAxesCombined,
  requirements: FileText,
  sales: TrendingUp,
};

export function AgentIcon({
  agentId,
  size = "md",
  className,
}: {
  agentId: AgentId;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = AGENT_ICONS[agentId];
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-xl border border-brand-dark/10 bg-brand-light",
        size === "sm" && "h-8 w-8",
        size === "md" && "h-11 w-11",
        size === "lg" && "h-14 w-14",
        className
      )}
    >
      <Icon className={cn(size === "sm" && "h-4 w-4", size === "md" && "h-5 w-5", size === "lg" && "h-6 w-6", "text-brand-dark/80")} />
    </span>
  );
}
