"use client";

import { useEffect, useRef, useState } from "react";
import { cn, trackSpotlight } from "@/lib/utils";
import { AdminMetric } from "@/types";

export function AdminCard({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={cn("admin-card", className)} style={style}>
      {children}
    </div>
  );
}

function useCountUp(value: number, duration = 600): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    let raf = 0;
    let start: number | null = null;
    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(Math.round(from + (to - from) * progress));
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    fromRef.current = to;
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

export function AdminKpiCard({
  label,
  value,
  icon: Icon,
  change,
  trend,
}: {
  label: string;
  value: number | string;
  icon?: React.ComponentType<{ size?: number }>;
  change?: AdminMetric["change"];
  trend?: AdminMetric["trend"];
}) {
  const isNumeric = typeof value === "number";
  const countedValue = useCountUp(isNumeric ? value : 0);

  return (
    <div
      className="admin-card admin-card--interactive group"
      onMouseMove={trackSpotlight}
    >
      <span
        aria-hidden="true"
        className="spotlight-overlay pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--dash-muted)",
          }}
        >
          {label}
        </span>
        {Icon && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(199,166,122,0.12)",
              color: "var(--dash-accent)",
              flexShrink: 0,
            }}
          >
            <Icon size={14} />
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--dash-text)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {isNumeric ? countedValue : value}
        </span>
        {change && trend && trend !== "neutral" && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color:
                trend === "up" ? "var(--dash-success)" : "var(--dash-danger)",
            }}
          >
            {trend === "up" ? "▲" : "▼"} {change}
          </span>
        )}
      </div>
    </div>
  );
}
