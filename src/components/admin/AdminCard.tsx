"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, trackSpotlight } from "@/lib/utils";
import { AdminMetric } from "@/types";

function useCountUp(target: number, duration = 600) {
  const [val, setVal] = useState(target);
  useEffect(() => {
    let current = 0;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;
    const timer = setInterval(() => {
      current += increment;
      if ((increment >= 0 && current >= target) || (increment < 0 && current <= target)) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(Math.round(current));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

export function AdminCard({
  children,
  className,
  style,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn("admin-card", className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function AdminKpiCard({
  label,
  value,
  icon: Icon,
  change,
  trend,
  onClick,
  active,
  style,
}: {
  label: string;
  value: number | string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  change?: AdminMetric["change"];
  trend?: AdminMetric["trend"];
  onClick?: () => void;
  active?: boolean;
  style?: React.CSSProperties;
}) {
  const isNumeric = typeof value === "number";
  const countedValue = useCountUp(isNumeric ? value : 0);

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "admin-card admin-card--interactive admin-card--glow group",
        onClick && "cursor-pointer",
        active && "border-[var(--dash-accent)] ring-1 ring-[var(--dash-accent)]"
      )}
      style={style}
      onMouseMove={trackSpotlight}
    >
      <span
        aria-hidden="true"
        className="spotlight-overlay pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="flex items-start justify-between mb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
          {label}
        </span>
        {Icon && (
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] shrink-0">
            <Icon size={14} className="text-current" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="admin-kpi-number text-2xl sm:text-[28px] font-bold text-[var(--dash-text)] tabular-nums font-serif">
          {isNumeric ? countedValue : value}
        </span>
        {change && trend && trend !== "neutral" && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              trend === "up" ? "text-[var(--dash-success)]" : "text-[var(--dash-danger)]"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
