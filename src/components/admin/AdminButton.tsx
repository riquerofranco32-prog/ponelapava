"use client";

type Variant = "primary" | "secondary" | "danger";

const VARIANT_STYLE: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--dash-accent)",
    color: "#1e1b15",
    border: "none",
  },
  secondary: {
    background: "var(--dash-surface-2)",
    color: "var(--dash-text)",
    border: "1px solid var(--dash-border)",
  },
  danger: {
    background: "var(--dash-danger-bg)",
    color: "var(--dash-danger)",
    border: "1px solid var(--dash-danger-border)",
  },
};

export function AdminButton({
  variant = "primary",
  disabled,
  fullWidth,
  children,
  onClick,
  type = "button",
  form,
}: {
  variant?: Variant;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  form?: string;
}) {
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...VARIANT_STYLE[disabled ? "secondary" : variant],
        width: fullWidth ? "100%" : undefined,
        borderRadius: 8,
        padding: "10px 18px",
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        WebkitTapHighlightColor: "transparent",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition: "filter 0.15s",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.filter = "brightness(1.1)";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.filter = "none";
      }}
    >
      {children}
    </button>
  );
}
