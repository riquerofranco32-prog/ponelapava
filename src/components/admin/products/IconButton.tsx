"use client";

export function IconButton({
  onClick,
  title,
  icon: Icon,
  danger = false,
}: {
  onClick: () => void;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: 30,
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        background: "var(--dash-surface-2)",
        border: "1px solid var(--dash-border)",
        color: danger ? "var(--dash-danger)" : "var(--dash-muted)",
        cursor: "pointer",
      }}
    >
      <Icon size={13} />
    </button>
  );
}
