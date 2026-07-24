import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#00205B] text-white",
        secondary: "bg-[#E2E8F0] text-[#64748B]",
        success: "bg-[#D1FAE5] text-[#065F46]",
        warning: "bg-[#FEF3C7] text-[#92400E]",
        danger: "bg-[#FEE2E2] text-[#991B1B]",
        info: "bg-[#DBEAFE] text-[#1E40AF]",
        purple: "bg-[#EDE9FE] text-[#5B21B6]",
        orange: "bg-[#FFEDD5] text-[#C2410C]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Status Badge - specialized for application/test status
export interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusBadgeConfig: Record<
  string,
  { variant: VariantProps<typeof badgeVariants>["variant"]; label: string }
> = {
  PENDING: { variant: "warning", label: "Menunggu" },
  ADMIN_CHECK: { variant: "info", label: "Verifikasi" },
  TEST_SCHEDULED: { variant: "purple", label: "Tes Terjadwal" },
  IN_TEST: { variant: "orange", label: "Sedang Tes" },
  TEST_COMPLETED: { variant: "info", label: "Tes Selesai" },
  INTERVIEW: { variant: "purple", label: "Interview" },
  MCU: { variant: "purple", label: "MCU" },
  OFFERED: { variant: "success", label: "Ditawarkan" },
  ACCEPTED: { variant: "success", label: "Diterima" },
  REJECTED: { variant: "danger", label: "Ditolak" },
  WITHDRAWN: { variant: "secondary", label: "Dibatalkan" },
  PASSED: { variant: "success", label: "Lulus" },
  FAILED: { variant: "danger", label: "Tidak Lulus" },
  ACTIVE: { variant: "success", label: "Aktif" },
  CLOSED: { variant: "secondary", label: "Ditutup" },
  DRAFT: { variant: "secondary", label: "Draft" },
};

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusBadgeConfig[status] || {
    variant: "secondary" as const,
    label: status,
  };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge };
