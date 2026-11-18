import { cn } from "@/lib/utils";

export type BookingStatus =
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected"
  | "cancelled";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type StatusType = BookingStatus | ApprovalStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  requested: {
    label: "Requested",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  accepted: {
    label: "Accepted",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase();
  const config = statusConfig[normalized] || {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs transition-colors",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default StatusBadge;
