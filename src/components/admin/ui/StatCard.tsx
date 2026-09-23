import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: {
    value: number | string;
    label?: string;
    positive?: boolean;
    neutral?: boolean;
  };
  icon?: React.ReactNode;
  sparkline?: number[];
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  delta,
  icon,
  sparkline,
  onClick,
  className = "",
}: StatCardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={`admin-card ${isInteractive ? "admin-card--interactive cursor-pointer" : ""} ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
          {title}
        </span>
        {icon && (
          <span className="w-8 h-8 rounded-lg bg-[var(--dash-surface-2)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-accent)] shrink-0">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div className="text-2xl font-bold tracking-tight text-[var(--dash-text)]">
          {value}
        </div>

        {sparkline && sparkline.length > 1 && (
          <div className="w-16 h-7 flex items-end gap-[2px] shrink-0 opacity-80">
            {(() => {
              const max = Math.max(...sparkline, 1);
              return sparkline.map((val, idx) => {
                const heightPct = Math.max(15, Math.round((val / max) * 100));
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-[var(--dash-accent)] rounded-t-sm"
                    style={{ height: `${heightPct}%` }}
                  />
                );
              });
            })()}
          </div>
        )}
      </div>

      {(subtitle || delta) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--dash-muted)]">
          {delta && (
            <span
              className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded ${
                delta.neutral
                  ? "bg-[var(--dash-surface-2)] text-[var(--dash-muted)]"
                  : delta.positive
                  ? "bg-[var(--dash-success-bg)] text-[var(--dash-success)]"
                  : "bg-[var(--dash-danger-bg)] text-[var(--dash-danger)]"
              }`}
            >
              {delta.neutral ? (
                <Minus className="w-3 h-3" />
              ) : delta.positive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {delta.value}
            </span>
          )}
          {delta?.label && <span>{delta.label}</span>}
          {subtitle && !delta?.label && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;
