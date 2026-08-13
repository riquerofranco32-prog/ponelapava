"use client";

export function AdminCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--dash-surface)",
        border: "1px solid var(--dash-border)",
        borderRadius: 12,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function AdminKpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon?: React.ComponentType<{ size?: number }>;
}) {
  return (
    <AdminCard>
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
      <span
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: 28,
          fontWeight: 700,
          color: "var(--dash-text)",
        }}
      >
        {value}
      </span>
    </AdminCard>
  );
}
