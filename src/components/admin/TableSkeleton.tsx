"use client";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="admin-skeleton-row"
          style={{
            height: 52,
            borderRadius: 8,
            background: "var(--dash-surface-2)",
            opacity: 1 - i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="admin-kpi-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="admin-card admin-skeleton-row"
          style={{ height: 84 }}
        />
      ))}
    </div>
  );
}
