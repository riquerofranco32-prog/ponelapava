"use client";

import { useState } from "react";
import { Tag, Percent, DollarSign, Sparkles } from "lucide-react";
import { Coupon, CouponInput } from "@/types";
import { storeDateKey, STORE_UTC_OFFSET } from "@/lib/hours";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminToggle } from "@/components/admin/AdminToggle";

const FORM_ID = "coupon-form";

interface CouponFormModalProps {
  coupon?: Coupon;
  onSave: (input: CouponInput) => Promise<void>;
  onCancel: () => void;
}

export default function CouponFormModal({
  coupon,
  onSave,
  onCancel,
}: CouponFormModalProps) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(
    coupon?.discountType ?? "percent",
  );
  const [discountValue, setDiscountValue] = useState<string>(
    coupon?.discountValue ? String(coupon.discountValue) : "",
  );
  const [validFrom, setValidFrom] = useState(
    coupon?.validFrom ? storeDateKey(coupon.validFrom) : "",
  );
  const [validUntil, setValidUntil] = useState(
    coupon?.validUntil ? storeDateKey(coupon.validUntil) : "",
  );
  const [active, setActive] = useState(coupon?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError("Ingresá un código para el cupón");
      return;
    }
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setError("Ingresá un valor de descuento válido mayor a 0");
      return;
    }
    if (discountType === "percent" && val > 100) {
      setError("El descuento porcentual no puede superar el 100%");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: val,
        validFrom: validFrom
          ? new Date(`${validFrom}T00:00:00${STORE_UTC_OFFSET}`).toISOString()
          : undefined,
        validUntil: validUntil
          ? new Date(`${validUntil}T23:59:59.999${STORE_UTC_OFFSET}`).toISOString()
          : undefined,
        active,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar cupón");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      title={coupon ? "Editar Cupón" : "Nuevo Cupón de Descuento"}
      onClose={onCancel}
      maxWidth={480}
      footer={
        <div className="flex justify-end gap-2.5">
          <AdminButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </AdminButton>
          <AdminButton
            type="submit"
            form={FORM_ID}
            variant="primary"
            disabled={saving}
          >
            {saving
              ? "Guardando..."
              : coupon
                ? "Guardar Cambios"
                : "Crear Cupón"}
          </AdminButton>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="grid gap-4">
        {error && (
          <div className="p-3 bg-[var(--dash-danger-bg)] border border-[var(--dash-danger-border)] rounded-lg text-[var(--dash-danger)] text-xs">
            {error}
          </div>
        )}

        <AdminField label="Código del Cupón *">
          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <Tag
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)]"
              />
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej: BIENVENIDO10, MATEROVIP"
                className="admin-input pl-9 tracking-wider font-semibold uppercase text-xs"
              />
            </div>

            {/* Quick Generator & Presets */}
            <div className="flex gap-1.5 flex-wrap items-center">
              <button
                type="button"
                onClick={() => {
                  const words = ["MATERO", "RONDA", "PAVA", "YERBA", "ESPECIAL"];
                  const randWord = words[Math.floor(Math.random() * words.length)];
                  const randNum = Math.floor(10 + Math.random() * 90);
                  setCode(`${randWord}${randNum}`);
                }}
                className="text-xs px-2 py-1 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] text-[var(--dash-accent)] cursor-pointer font-semibold inline-flex items-center gap-1"
              >
                <Sparkles size={11} />
                <span>Generar Código</span>
              </button>
              {["BIENVENIDO10", "MATERO15", "RONDA20"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCode(preset)}
                  className="text-xs px-2 py-1 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] text-[var(--dash-muted)] cursor-pointer hover:text-[var(--dash-text)]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </AdminField>

        <div className="grid grid-cols-2 gap-3">
          <AdminField label="Tipo de Descuento *">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setDiscountType("percent")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  discountType === "percent"
                    ? "border-[var(--dash-accent)] bg-[var(--dash-accent-subtle)] text-[var(--dash-accent)] font-semibold"
                    : "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)]"
                }`}
              >
                <Percent size={14} />
                <span>Porcentaje</span>
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("fixed")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  discountType === "fixed"
                    ? "border-[var(--dash-accent)] bg-[var(--dash-accent-subtle)] text-[var(--dash-accent)] font-semibold"
                    : "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)]"
                }`}
              >
                <DollarSign size={14} />
                <span>Monto Fijo</span>
              </button>
            </div>
          </AdminField>

          <AdminField
            label={discountType === "percent" ? "Valor (%) *" : "Valor ($) *"}
          >
            <input
              type="number"
              min="0.1"
              step={discountType === "percent" ? "1" : "50"}
              max={discountType === "percent" ? "100" : undefined}
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "percent" ? "10" : "5000"}
              className="admin-input text-xs"
            />
          </AdminField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AdminField label="Válido desde (opcional)">
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="admin-input text-xs"
            />
          </AdminField>

          <AdminField label="Válido hasta (opcional)">
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="admin-input text-xs"
            />
          </AdminField>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-[var(--dash-surface-elevated)] rounded-xl border border-[var(--dash-border)]">
          <div>
            <div className="text-xs font-semibold text-[var(--dash-text)]">
              Cupón Habilitado
            </div>
            <div className="text-xs text-[var(--dash-muted)]">
              Permite su uso en presupuestos y ventas
            </div>
          </div>
          <AdminToggle
            checked={active}
            onChange={(val) => setActive(val)}
            label=""
          />
        </div>
      </form>
    </AdminModal>
  );
}
