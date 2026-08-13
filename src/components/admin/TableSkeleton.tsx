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
