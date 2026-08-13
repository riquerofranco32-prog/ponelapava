"use client";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: "var(--dash-surface)",
        border: "1px solid var(--dash-border)",
        borderRadius: 12,
        padding: 40,
        textAlign: "center",
      }}
    >
      <Icon
        size={32}
        style={{ margin: "0 auto 16px", color: "var(--dash-muted)" }}
      />
      <h2
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
          color: "var(--dash-text)",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--dash-muted)",
          maxWidth: 420,
          margin: "0 auto",
        }}
      >
        {description}
      </p>
    </div>
  );
}
