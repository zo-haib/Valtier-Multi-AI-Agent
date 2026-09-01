import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, id, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-sm text-brand-dark/60">
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={cn(
        "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30",
        "outline-none transition-colors focus:border-brand-dark/40",
        className
      )}
      {...props}
    />
  </div>
));
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-brand-dark/60">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-brand-dark/30",
          "outline-none transition-colors focus:border-brand-dark/40 resize-none",
          className
        )}
        {...props}
      />
    </div>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, label, id, children, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-sm text-brand-dark/60">
        {label}
      </label>
    )}
    <select
      ref={ref}
      id={id}
      className={cn(
        "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 text-sm text-brand-dark",
        "outline-none transition-colors focus:border-brand-dark/40",
        className
      )}
      {...props}
    >
      {children}
    </select>
  </div>
));
Select.displayName = "Select";
