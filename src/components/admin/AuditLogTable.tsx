"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { AuditLogEntry, AuditAction } from "@/lib/auditLog";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { assertOk } from "@/lib/admin-fetch";

const ACTION_LABELS: Record<AuditAction, string> = {
  order_status_change: "Cambio de estado de pedido",
  product_update: "Producto actualizado",
  product_delete: "Producto eliminado",
  settings_update: "Configuración actualizada",
};

function describeDetails(entry: AuditLogEntry): string {
  const d = entry.details;
  switch (entry.action) {
    case "order_status_change":
      return `Nuevo estado: ${d.status}`;
    case "product_update": {
      const stock = d.stock as { before?: number; after?: number } | undefined;
      const status = d.status as
        { before?: string; after?: string } | undefined;
      const parts: string[] = [String(d.name ?? entry.entityId ?? "")];
      if (stock && stock.before !== stock.after) {
        parts.push(`stock ${stock.before} → ${stock.after}`);
      }
      if (status && status.before !== status.after) {
        parts.push(`estado ${status.before} → ${status.after}`);
      }
      return parts.join(" · ");
    }
    case "product_delete":
      return String(d.name ?? entry.entityId ?? "");
    case "settings_update":
      return "Configuración del sitio";
    default:
      return "";
  }
}

export default function AuditLogTable() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/audit-log");
        assertOk(res, "No se pudo cargar el registro de actividad");
        setEntries(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <TableSkeleton rows={6} />;

  if (error) return <div className="admin-error-banner">{error}</div>;

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Todavía no hay actividad registrada"
        description="Los cambios de estado de pedidos, productos y configuración van a aparecer acá."
      />
    );
  }

  const th: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--dash-muted)",
  };
  const td: React.CSSProperties = {
    padding: "12px 14px",
    borderTop: "1px solid var(--dash-border)",
    verticalAlign: "top",
  };

  return (
    <>
      <div
        className="admin-desktop-only"
        style={{ overflowX: "auto", maxHeight: "70vh" }}
      >
        <table
          className="admin-table"
          style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th style={th}>Fecha</th>
              <th style={th}>Admin</th>
              <th style={th}>Acción</th>
              <th style={th}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id}
                className="admin-row-in"
                style={{ "--i": index } as React.CSSProperties}
              >
                <td
                  style={{
                    ...td,
                    color: "var(--dash-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Date(entry.createdAt).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td style={{ ...td, color: "var(--dash-text)" }}>
                  {entry.actorEmail}
                </td>
                <td style={{ ...td, color: "var(--dash-text)" }}>
                  {ACTION_LABELS[entry.action] ?? entry.action}
                </td>
                <td style={{ ...td, color: "var(--dash-muted)" }}>
                  {describeDetails(entry)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="admin-mobile-only"
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="admin-row-in"
            style={
              {
                padding: 14,
                background: "var(--dash-surface)",
                border: "1px solid var(--dash-border)",
                borderRadius: 10,
                "--i": index,
              } as React.CSSProperties
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                fontSize: 12,
                color: "var(--dash-muted)",
                marginBottom: 6,
              }}
            >
              <span>{entry.actorEmail}</span>
              <span style={{ whiteSpace: "nowrap" }}>
                {new Date(entry.createdAt).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p
              style={{
                fontWeight: 500,
                color: "var(--dash-text)",
                marginBottom: 4,
              }}
            >
              {ACTION_LABELS[entry.action] ?? entry.action}
            </p>
            <p style={{ fontSize: 13, color: "var(--dash-muted)" }}>
              {describeDetails(entry)}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
