export const adminLabelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--dash-muted)",
  fontSize: "var(--dash-text-xs)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
};

export function AdminLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)] mb-1.5 ${className}`.trim()}>
      {children}
    </label>
  );
}

export function AdminField({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      <AdminLabel>{label}</AdminLabel>
      {children}
      {error && (
        <p className="text-xs text-[var(--dash-danger)] mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
