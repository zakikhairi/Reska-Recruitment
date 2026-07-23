"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
  }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-[#FF5E00] transition-all duration-500 ease-out",
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// Specialized progress for test timer
const TimerProgress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: number;
    max: number;
    warning?: boolean;
    critical?: boolean;
  }
>(({ className, value, max, warning, critical, ...props }, ref) => {
  const percentage = (value / max) * 100;

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-[#E2E8F0]",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-1000 ease-linear",
          critical
            ? "bg-[#EF4444]"
            : warning
            ? "bg-[#F59E0B]"
            : "bg-[#FF5E00]"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});
TimerProgress.displayName = "TimerProgress";

export { Progress, TimerProgress };
