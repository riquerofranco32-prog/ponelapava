export function AdminErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        marginBottom: 20,
        background: "var(--dash-danger-bg)",
        border: "1px solid var(--dash-danger-border)",
        borderRadius: 8,
        padding: "12px 16px",
        fontSize: 14,
        color: "var(--dash-danger)",
      }}
    >
      {message}
    </div>
  );
}
