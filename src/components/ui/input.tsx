import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
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
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={id}
            className={cn(
              "flex h-11 w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#0F172A] transition-all duration-150",
              "placeholder:text-[#94A3B8]",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]",
              error
                ? "border-[#EF4444] focus:ring-[#EF4444]/20 focus:border-[#EF4444]"
                : "border-[#E2E8F0] focus:ring-[#FF5E00]/20 focus:border-[#FF5E00]",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[#64748B]">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
