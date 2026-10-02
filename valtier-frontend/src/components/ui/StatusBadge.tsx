import { cn } from "../../lib/cn";

type Status =
  | "running"
  | "completed"
  | "failed"
  | "waiting"
  | "ready"
  | "working"
  | "offline"
  | "active"
  | "suspended"
  | "cancelled"
  | "past_due"
  | "open"
  | "resolved"
  | "success"
  | "processing"
  | "approved"
  | "in-review"
  | "draft"
  | "on-track"
  | "at-risk";

const STATUS_STYLES: Record<string, string> = {
  running: "bg-blue-50 text-blue-700 border-blue-200",
  working: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  "in-review": "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-brand-green/10 text-brand-green border-brand-green/25",
  ready: "bg-brand-green/10 text-brand-green border-brand-green/25",
  active: "bg-brand-green/10 text-brand-green border-brand-green/25",
  resolved: "bg-brand-green/10 text-brand-green border-brand-green/25",
  success: "bg-brand-green/10 text-brand-green border-brand-green/25",
  approved: "bg-brand-green/10 text-brand-green border-brand-green/25",
  "on-track": "bg-brand-green/10 text-brand-green border-brand-green/25",
  failed: "bg-red-50 text-red-700 border-red-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  past_due: "bg-red-50 text-red-700 border-red-200",
  open: "bg-amber-50 text-amber-700 border-amber-200",
  "at-risk": "bg-amber-50 text-amber-700 border-amber-200",
  waiting: "bg-brand-dark/5 text-brand-dark/60 border-brand-dark/10",
  offline: "bg-brand-dark/5 text-brand-dark/60 border-brand-dark/10",
  cancelled: "bg-brand-dark/5 text-brand-dark/60 border-brand-dark/10",
  draft: "bg-brand-dark/5 text-brand-dark/60 border-brand-dark/10",
};

export function StatusBadge({ status, label }: { status: Status | string; label?: string }) {
  const style = STATUS_STYLES[status] ?? "bg-brand-dark/5 text-brand-dark/60 border-brand-dark/10";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        style
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? status.replace(/_/g, " ").replace(/-/g, " ")}
    </span>
  );
}
