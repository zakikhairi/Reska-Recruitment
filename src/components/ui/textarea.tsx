import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const id = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[#0F172A] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#EF4444] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={id}
          className={cn(
            "flex min-h-[120px] w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#0F172A] transition-all duration-150",
            "placeholder:text-[#94A3B8]",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]",
            "resize-y",
            error
              ? "border-[#EF4444] focus:ring-[#EF4444]/20 focus:border-[#EF4444]"
              : "border-[#E2E8F0] focus:ring-[#FF5E00]/20 focus:border-[#FF5E00]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[#64748B]">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
