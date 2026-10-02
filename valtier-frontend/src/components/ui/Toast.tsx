import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

interface Toast {
  id: string;
  message: string;
  variant: "success" | "error" | "info";
}

interface ToastContextValue {
  showToast: (message: string, variant?: Toast["variant"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: Toast["variant"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.variant];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-brand-dark/10 bg-white px-4 py-3 text-sm text-brand-dark shadow-lg min-w-[260px]"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    toast.variant === "success" && "text-brand-green",
                    toast.variant === "error" && "text-red-500",
                    toast.variant === "info" && "text-brand-dark/50"
                  )}
                />
                <span className="flex-1">{toast.message}</span>
                <button onClick={() => dismiss(toast.id)} className="text-brand-dark/40 hover:text-brand-dark">
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
