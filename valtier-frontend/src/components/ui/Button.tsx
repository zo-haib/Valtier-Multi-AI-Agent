import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none",
          variant === "primary" && "bg-brand-dark text-white hover:bg-brand-green",
          variant === "secondary" &&
            "bg-white text-brand-dark border border-brand-dark/15 hover:bg-brand-light",
          variant === "ghost" && "text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5",
          variant === "danger" && "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
          size === "sm" && "px-3.5 py-1.5 text-sm",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-7 py-3.5 text-base",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
