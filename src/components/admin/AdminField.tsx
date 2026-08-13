export const adminLabelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--dash-muted)",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 6,
};

export function AdminLabel({ children }: { children: React.ReactNode }) {
  return <label style={adminLabelStyle}>{children}</label>;
}

export function AdminField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <AdminLabel>{label}</AdminLabel>
      {children}
      {error && (
        <p style={{ color: "var(--dash-danger)", fontSize: 12, marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}
