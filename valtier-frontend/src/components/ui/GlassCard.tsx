import { type HTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

// Kept the export name `GlassCard` (used throughout the app) to avoid a
// mechanical rename across ~20 consuming files, but the implementation
// is now a plain editorial card — white background, a hairline border,
// no blur/glass, no gradient — per the redesign's "subtle borders and
// whitespace instead of excessive shadows" / "no excessive
// glassmorphism" direction.
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, padding = "md", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "rounded-2xl border border-brand-dark/10 bg-white",
          hover && "transition-colors duration-200 hover:border-brand-dark/20",
          padding === "sm" && "p-4",
          padding === "md" && "p-6",
          padding === "lg" && "p-8",
          className
        )}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
