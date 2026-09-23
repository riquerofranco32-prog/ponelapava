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
      className="mb-4 border border-[var(--dash-danger)] rounded-[var(--dash-radius-md)] bg-[var(--dash-danger-bg)] overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex items-center gap-2.5 w-full py-3 px-3.5 bg-transparent border-none cursor-pointer text-left text-[var(--dash-text)]"
      >
        <AlertTriangle size={18} aria-hidden className="shrink-0 text-[var(--dash-danger)]" />
        <span className="flex-1 text-sm font-semibold">
          {failed.length === 1
            ? "1 pedido salió por WhatsApp y no quedó registrado"
            : `${failed.length} pedidos salieron por WhatsApp y no quedaron registrados`}
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <ul className="list-none m-0 px-3.5 pb-3 flex flex-col gap-2.5">
          {failed.map((f) => (
            <li
              key={f.id}
              className="border-t border-[var(--dash-border)] pt-2.5 text-xs sm:text-sm leading-relaxed"
            >
              <div className="flex flex-wrap gap-2 text-[var(--dash-muted)] text-xs">
                <span>{formatDate(f.createdAt)}</span>
                <span>·</span>
                <span>{STAGE_LABELS[f.stage] ?? f.stage}</span>
              </div>
              <div className="text-[var(--dash-text)] font-semibold">
                {f.customerName || "Sin nombre"}
                {f.customerPhone ? ` · ${f.customerPhone}` : ""}
              </div>
              <div className="text-[var(--dash-muted)]">{f.reason}</div>
              <div className="text-[var(--dash-muted)] text-xs">
                Carrito: {describeItems(f.items)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
