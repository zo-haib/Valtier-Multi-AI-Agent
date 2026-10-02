import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-valtier-bg/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="relative z-10 h-full w-[280px]"
          >
            <div className="relative h-full">
              <Sidebar onNavigate={onClose} />
              <button
                onClick={onClose}
                className="absolute right-3 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-valtier-card text-valtier-muted hover:text-white border border-valtier-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
