import type { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { cn } from "../../lib/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <GlassCard hover padding="md" className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-brand-dark/60">{label}</span>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light border border-brand-dark/10">
            <Icon className="h-4 w-4 text-brand-dark/70" />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="font-helvetica-neue text-3xl tracking-tight text-brand-dark">{value}</span>
        {trend && <span className="text-xs text-brand-dark/40">{trend}</span>}
      </div>
    </GlassCard>
  );
}
