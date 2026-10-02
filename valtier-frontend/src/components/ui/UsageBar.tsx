import { cn } from "../../lib/cn";
import { Zap } from "lucide-react";

interface UsageBarProps {
  used: number;
  total: number;
  label?: string;
  resetsInDays?: number;
  className?: string;
}

export function UsageBar({ used, total, label = "AI Credits", resetsInDays, className }: UsageBarProps) {
  const percentage = Math.min(Math.max((used / total) * 100, 0), 100);
  const isWarning = percentage > 80;
  const isCritical = percentage > 95;

  return (
    <div className={cn("glass p-5 rounded-2xl", className)}>
      <div className="flex justify-between items-end mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-4 h-4 text-valtier-accent" />
            <span className="text-sm font-medium text-valtier-text">{label}</span>
          </div>
          <div className="text-2xl font-bold">
            {used.toLocaleString()} <span className="text-sm font-normal text-valtier-muted">/ {total.toLocaleString()}</span>
          </div>
        </div>
        {resetsInDays !== undefined && (
          <div className="text-xs text-valtier-muted">
            Resets in {resetsInDays} days
          </div>
        )}
      </div>
      
      <div className="h-2.5 w-full bg-valtier-surface rounded-full overflow-hidden border border-valtier-border">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            isCritical ? "bg-valtier-rose" : isWarning ? "bg-valtier-amber" : "bg-gradient-valtier"
          )}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
