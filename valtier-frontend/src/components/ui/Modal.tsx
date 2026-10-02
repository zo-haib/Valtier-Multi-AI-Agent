import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-2xl border border-brand-dark/10 bg-white p-6",
              className
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              {title && <h3 className="text-lg font-medium text-brand-dark">{title}</h3>}
              <button
                onClick={onClose}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-brand-dark/50 hover:bg-brand-dark/5 hover:text-brand-dark"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
