"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Package } from "lucide-react";
import { Product, StockMovementReason } from "@/types";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminField } from "@/components/admin/AdminField";
import { useAdminToast } from "@/components/admin/AdminToast";

interface StockAdjustModalProps {
  product: Product;
  onClose: () => void;
  onAdjusted: (newStock: number) => void;
}

const REASON_OPTIONS: { value: StockMovementReason; label: string; defaultSign: 1 | -1 }[] = [
  { value: "purchase", label: "Compra / Reposición de proveedor (+)", defaultSign: 1 },
  { value: "adjustment", label: "Ajuste manual de inventario (+ / -)", defaultSign: 1 },
  { value: "loss", label: "Pérdida / Rotura / Merma (-)", defaultSign: -1 },
  { value: "sale", label: "Venta directa fuera de la tienda (-)", defaultSign: -1 },
  { value: "return", label: "Devolución de cliente (+)", defaultSign: 1 },
];

export function StockAdjustModal({ product, onClose, onAdjusted }: StockAdjustModalProps) {
  const [reason, setReason] = useState<StockMovementReason>("purchase");
  const [sign, setSign] = useState<1 | -1>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showToast = useAdminToast();

  const handleReasonChange = (newReason: StockMovementReason) => {
    setReason(newReason);
    const opt = REASON_OPTIONS.find((r) => r.value === newReason);
    if (opt) setSign(opt.defaultSign);
  };

  const delta = sign * Math.max(1, quantity || 0);
  const calculatedStock = Math.max(0, product.stock + delta);
  const isLoss = reason === "loss";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (quantity <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    if (isLoss && !note.trim()) {
      setError("Es obligatorio ingresar una nota justificando la pérdida o rotura");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          delta,
          reason,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar ajuste de stock");
      }

      showToast(`Stock actualizado a ${data.newStock} unidades`);
      onAdjusted(data.newStock);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      title="Ajustar stock de inventario"
      onClose={onClose}
      maxWidth={520}
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="admin-btn admin-btn--secondary"
          >
            Cancelar
          </button>
          <AdminButton
            onClick={handleSubmit}
            disabled={saving || quantity <= 0 || (isLoss && !note.trim())}
          >
            {saving ? "Guardando..." : "Confirmar ajuste"}
          </AdminButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info del producto actual */}
        <div className="flex items-center gap-3 p-3 bg-[var(--dash-surface-2)] rounded-[var(--dash-radius-md)] border border-[var(--dash-border)]">
          <div className="w-10 h-10 rounded-[var(--dash-radius-sm)] bg-[var(--dash-surface-3)] flex items-center justify-center shrink-0">
            <Package size={20} className="text-[var(--dash-accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-[var(--dash-text)] truncate m-0">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-[var(--dash-muted)] mt-0.5">
              <span>Stock actual: <strong className="text-[var(--dash-text)]">{product.stock} un.</strong></span>
              <span>•</span>
              <span>Mínimo: {product.minStock ?? 5} un.</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs bg-[var(--dash-danger-bg)] border border-[var(--dash-danger-border)] text-[var(--dash-danger)] rounded-[var(--dash-radius-sm)]">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Motivo */}
        <AdminField label="Motivo del movimiento">
          <select
            value={reason}
            onChange={(e) => handleReasonChange(e.target.value as StockMovementReason)}
            className="admin-input !text-xs"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </AdminField>

        {/* Dirección y Cantidad */}
        <div className="grid grid-cols-2 gap-3">
          <AdminField label="Acción">
            <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-[var(--dash-surface-2)] rounded-[var(--dash-radius-md)] border border-[var(--dash-border)]">
              <button
                type="button"
                onClick={() => setSign(1)}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-[var(--dash-radius-sm)] border-none cursor-pointer transition-all ${
                  sign === 1
                    ? "bg-[var(--dash-success)] text-white shadow-sm"
                    : "bg-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                }`}
              >
                <ArrowUpRight size={14} />
                <span>Sumar (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setSign(-1)}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-[var(--dash-radius-sm)] border-none cursor-pointer transition-all ${
                  sign === -1
                    ? "bg-[var(--dash-danger)] text-white shadow-sm"
                    : "bg-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                }`}
              >
                <ArrowDownRight size={14} />
                <span>Restar (-)</span>
              </button>
            </div>
          </AdminField>

          <AdminField label="Cantidad (unidades)">
            <input
              type="number"
              min={1}
              max={100000}
              value={quantity || ""}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
              className="admin-input !text-xs font-semibold"
              placeholder="Ej: 10"
              required
            />
          </AdminField>
        </div>

        {/* Resultado proyectado */}
        <div className="p-3 bg-[var(--dash-surface-3)] rounded-[var(--dash-radius-md)] border border-[var(--dash-border)] flex items-center justify-between">
          <span className="text-xs text-[var(--dash-muted)]">Nuevo stock resultante:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--dash-muted)] line-through">
              {product.stock}
            </span>
            <span className="text-sm font-bold text-[var(--dash-accent)]">
              → {calculatedStock} un.
            </span>
            {calculatedStock === 0 && (
              <span className="text-xs text-[var(--dash-danger)] font-medium">
                (Agotado)
              </span>
            )}
          </div>
        </div>

        {/* Nota / Justificación */}
        <AdminField
          label={`Nota o justificativo ${isLoss ? "(Obligatorio por pérdida)" : "(Opcional)"}`}
        >
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isLoss
                ? "Ej: Paquete de yerba roto durante descarga de camión"
                : "Ej: Factura proveedor #12345 o conteo físico"
            }
            className="admin-input !text-xs"
            required={isLoss}
          />
        </AdminField>
      </form>
    </AdminModal>
  );
}
