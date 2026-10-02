import { Menu, Bot } from "lucide-react";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-valtier-border bg-valtier-surface/90 backdrop-blur-md px-4 py-3.5 lg:hidden sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-gradient-valtier flex items-center justify-center shadow-glow-sm">
          <Bot className="text-white w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white">VALTIER</span>
      </div>
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-valtier-border bg-valtier-card text-valtier-muted hover:text-white"
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}
