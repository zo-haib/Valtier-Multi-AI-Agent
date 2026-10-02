import { Hand, Users, Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";

export type AutonomyLevel = "manual" | "assisted" | "autonomous";

interface AutonomySelectorProps {
  value: AutonomyLevel;
  onChange: (value: AutonomyLevel) => void;
}

const OPTIONS = [
  { id: "manual", icon: Hand, label: "Manual", desc: "You assign subtasks manually." },
  { id: "assisted", icon: Users, label: "Assisted", desc: "AI suggests, you approve." },
  { id: "autonomous", icon: Sparkles, label: "Autonomous", desc: "Full orchestration." },
];

export function AutonomySelector({ value, onChange }: AutonomySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id as AutonomyLevel)}
          className={cn(
            "flex flex-col items-center p-3 rounded-xl border text-center transition-all",
            value === opt.id
              ? "border-valtier-accent bg-valtier-accent/10 shadow-glow-sm"
              : "border-valtier-border bg-valtier-surface hover:bg-valtier-card text-valtier-muted hover:text-white"
          )}
        >
          <opt.icon className={cn("w-5 h-5 mb-2", value === opt.id ? "text-valtier-accent" : "text-valtier-muted")} />
          <span className={cn("text-xs font-bold", value === opt.id ? "text-white" : "")}>{opt.label}</span>
          <span className="text-[10px] mt-1 hidden sm:block opacity-70">{opt.desc}</span>
        </button>
      ))}
    </div>
  );
}
