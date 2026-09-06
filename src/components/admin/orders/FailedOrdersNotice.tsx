"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { FailedOrder } from "@/lib/failedOrders";
import { assertOk } from "@/lib/admin-fetch";

const STAGE_LABELS: Record<FailedOrder["stage"], string> = {
  payload: "Pedido malformado",
  validation: "Rechazado al validar",
  server: "Error del servidor",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function describeItems(items: FailedOrder["items"]): string {
  if (!items.length) return "sin ítems";
  return items
    .map((i) => `${i.productId ?? "?"} ×${i.quantity ?? "?"}`)
    .join(", ");
}

// Se monta arriba de la tabla de pedidos y no dibuja nada cuando no hay
// fallos, que es el estado normal. Cuando aparece, es porque una venta se
// cerró por WhatsApp y no quedó registrada: el dato accionable es el teléfono
// del cliente y qué había en el carrito.
export default function FailedOrdersNotice() {
  const [failed, setFailed] = useState<FailedOrder[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/failed-orders");
        assertOk(res, "No se pudo cargar el registro de pedidos fallidos");
        const data = (await res.json()) as FailedOrder[];
        if (!cancelled && Array.isArray(data)) setFailed(data);
      } catch {
        // Silencioso a propósito: este bloque es un extra sobre la tabla de
        // pedidos y no debe romperla si la consulta falla.
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed.length === 0) return null;

  return (
    <section
      aria-label="Pedidos no registrados"
      style={{
        marginBottom: 18,
        border: "1px solid var(--dash-danger, #b13f2c)",
        borderRadius: 10,
        background: "color-mix(in srgb, var(--dash-danger, #b13f2c) 8%, transparent)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "12px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "var(--dash-text)",
          font: "inherit",
        }}
      >
        <AlertTriangle size={18} aria-hidden style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
          {failed.length === 1
            ? "1 pedido salió por WhatsApp y no quedó registrado"
            : `${failed.length} pedidos salieron por WhatsApp y no quedaron registrados`}
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          style={{
            flexShrink: 0,
            transition: "transform 200ms",
            transform: expanded ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      {expanded && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: "0 14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {failed.map((f) => (
            <li
              key={f.id}
              style={{
                borderTop: "1px solid var(--dash-border)",
                paddingTop: 10,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  color: "var(--dash-muted)",
                  fontSize: 12,
                }}
              >
                <span>{formatDate(f.createdAt)}</span>
                <span>·</span>
                <span>{STAGE_LABELS[f.stage] ?? f.stage}</span>
              </div>
              <div style={{ color: "var(--dash-text)", fontWeight: 600 }}>
                {f.customerName || "Sin nombre"}
                {f.customerPhone ? ` · ${f.customerPhone}` : ""}
              </div>
              <div style={{ color: "var(--dash-muted)" }}>{f.reason}</div>
              <div style={{ color: "var(--dash-muted)", fontSize: 12 }}>
                Carrito: {describeItems(f.items)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
