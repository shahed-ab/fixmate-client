import { cn } from "@/lib/utils";

export type PaymentStatus = "paid" | "unpaid" | string;

interface PaymentBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  const isPaid = (status || "").toLowerCase() === "paid";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs transition-colors",
        isPaid
          ? "bg-teal-50 text-teal-700 border-teal-200"
          : "bg-amber-50 text-amber-700 border-amber-200",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isPaid ? "bg-teal-600" : "bg-amber-600"
        )}
        aria-hidden="true"
      />
      {isPaid ? "Paid" : "Unpaid"}
    </span>
  );
}

export default PaymentBadge;
