"use client";

import { useEffect, useState } from "react";
import { History, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";
import { Product, StockMovement, StockMovementReason } from "@/types";
import { AdminModal } from "@/components/admin/AdminModal";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

interface StockHistoryModalProps {
  product: Product;
  onClose: () => void;
}

const REASON_BADGES: Record<StockMovementReason, { label: string; bg: string; text: string }> = {
  purchase: {
    label: "Compra / Reposición",
    bg: "var(--dash-success-bg)",
    text: "var(--dash-success)",
  },
  adjustment: {
    label: "Ajuste manual",
    bg: "var(--dash-accent-subtle)",
    text: "var(--dash-accent)",
  },
  loss: {
    label: "Pérdida / Rotura",
    bg: "var(--dash-danger-bg)",
    text: "var(--dash-danger)",
  },
  sale: {
    label: "Venta",
    bg: "var(--dash-surface-3)",
    text: "var(--dash-text)",
  },
  return: {
    label: "Devolución",
    bg: "var(--dash-info-bg)",
    text: "var(--dash-info)",
  },
};

export function StockHistoryModal({ product, onClose }: StockHistoryModalProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/stock/movements?productId=${product.id}`);
        if (!res.ok) throw new Error("Error al obtener movimientos de stock");
        const data = await res.json();
        setMovements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [product.id]);

  return (
    <AdminModal
      title="Historial de inventario y movimientos"
      onClose={onClose}
      maxWidth={620}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn--secondary"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Info del producto */}
        <div className="flex items-center justify-between p-3 bg-[var(--dash-surface-2)] rounded-[var(--dash-radius-md)] border border-[var(--dash-border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Package size={18} className="text-[var(--dash-accent)] shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-[var(--dash-text)] truncate m-0">
                {product.name}
              </h4>
              <span className="text-xs text-[var(--dash-muted)]">
                Stock actual: <strong className="text-[var(--dash-text)]">{product.stock} un.</strong>
              </span>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 bg-[var(--dash-surface-3)] text-[var(--dash-text)] rounded-[var(--dash-radius-pill)] border border-[var(--dash-border)] font-semibold shrink-0">
            {movements.length} registro{movements.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Listado de movimientos */}
        {loading ? (
          <TableSkeleton rows={4} />
        ) : error ? (
          <div className="p-4 text-xs text-[var(--dash-danger)] bg-[var(--dash-danger-bg)] border border-[var(--dash-danger-border)] rounded-[var(--dash-radius-sm)]">
            {error}
          </div>
        ) : movements.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--dash-muted)] bg-[var(--dash-surface-2)] rounded-[var(--dash-radius-md)] border border-[var(--dash-border)]">
            <History size={24} className="mx-auto mb-2 opacity-40 text-[var(--dash-muted)]" />
            <p className="m-0 font-medium">Sin movimientos registrados para este producto.</p>
            <p className="m-0 text-xs opacity-75 mt-1">Los ajustes futuros y ventas quedarán asentados aquí.</p>
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto border border-[var(--dash-border)] rounded-[var(--dash-radius-md)] divide-y divide-[var(--dash-border-subtle)]">
            {movements.map((m) => {
              const badge = REASON_BADGES[m.reason] || {
                label: m.reason,
                bg: "var(--dash-surface-3)",
                text: "var(--dash-text)",
              };
              const isPositive = m.delta > 0;

              return (
                <div
                  key={m.id}
                  className="p-3 bg-[var(--dash-surface)] hover:bg-[var(--dash-surface-2)] transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-[var(--dash-muted)]">
                        {new Date(m.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {m.note && (
                      <p className="m-0 text-xs text-[var(--dash-text)] italic">
                        &ldquo;{m.note}&rdquo;
                      </p>
                    )}

                    <span className="text-xs text-[var(--dash-muted)] block">
                      Registrado por: {m.createdBy || "Sistema"}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 font-bold text-sm">
                    {isPositive ? (
                      <span className="inline-flex items-center text-[var(--dash-success)]">
                        <ArrowUpRight size={16} />+{m.delta}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[var(--dash-danger)]">
                        <ArrowDownRight size={16} />
                        {m.delta}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminModal>
  );
}
