import { Menu, Triangle } from "lucide-react";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-brand-dark/10 bg-brand-cream/90 backdrop-blur-md px-4 py-3.5 lg:hidden">
      <div className="flex items-center gap-2">
        <Triangle className="h-4 w-4 text-brand-dark fill-brand-dark" />
        <span className="text-base tracking-tight font-helvetica-neue">Valtier</span>
      </div>
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-dark/10 bg-white text-brand-dark/70"
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}
