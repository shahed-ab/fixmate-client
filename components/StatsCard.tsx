import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
