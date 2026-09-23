"use client";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="admin-skeleton-row h-[52px] rounded-[var(--dash-radius-md)] bg-[var(--dash-surface-2)]"
          style={{ opacity: 1 - i * 0.08 }}
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
          className="admin-card admin-skeleton-row h-[84px]"
        />
      ))}
    </div>
  );
}
