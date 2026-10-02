import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-brand-dark/10", className)}>
      <div
        className="h-full rounded-full bg-brand-green transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-brand-dark/10 bg-brand-light font-medium text-brand-dark/80",
        size === "sm" && "h-7 w-7 text-xs",
        size === "md" && "h-9 w-9 text-sm",
        size === "lg" && "h-12 w-12 text-base"
      )}
    >
      {initials}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-dark/15 py-16 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light border border-brand-dark/10">
          <Icon className="h-5 w-5 text-brand-dark/50" />
        </span>
      )}
      <p className="text-sm font-medium text-brand-dark/80">{title}</p>
      {description && <p className="max-w-sm text-sm text-brand-dark/50">{description}</p>}
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-brand-dark/50">
      <Loader2 className="h-5 w-5 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ label = "Something went wrong.", onRetry }: { label?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-16 text-center">
      <p className="text-sm font-medium text-red-700">{label}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-red-700 underline underline-offset-2 hover:no-underline">
          Try again
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-brand-dark/5", className)} />;
}
