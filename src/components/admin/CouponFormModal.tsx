"use client";

import { useState } from "react";
import { Tag, Percent, DollarSign } from "lucide-react";
import { Coupon, CouponInput } from "@/types";
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
    coupon?.validFrom ? coupon.validFrom.split("T")[0] : "",
  );
  const [validUntil, setValidUntil] = useState(
    coupon?.validUntil ? coupon.validUntil.split("T")[0] : "",
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
        validFrom: validFrom ? new Date(validFrom).toISOString() : undefined,
        validUntil: validUntil
          ? new Date(`${validUntil}T23:59:59.999Z`).toISOString()
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
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
      <form id={FORM_ID} onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid var(--dash-danger)",
              borderRadius: "var(--radius-control)",
              color: "var(--dash-danger)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <AdminField label="Código del Cupón *">
          <div style={{ position: "relative" }}>
            <Tag
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--dash-text-muted)",
              }}
            />
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: BIENVENIDO10, MATEROVIP"
              className="admin-input"
              style={{ paddingLeft: 34, letterSpacing: "0.05em", fontWeight: 600 }}
            />
          </div>
        </AdminField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <AdminField label="Tipo de Descuento *">
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => setDiscountType("percent")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "8px 10px",
                  borderRadius: "var(--radius-control)",
                  border:
                    discountType === "percent"
                      ? "2px solid var(--dash-accent)"
                      : "1px solid var(--dash-border)",
                  background:
                    discountType === "percent"
                      ? "var(--dash-accent-subtle)"
                      : "var(--dash-surface)",
                  color:
                    discountType === "percent"
                      ? "var(--dash-accent)"
                      : "var(--dash-text)",
                  fontWeight: discountType === "percent" ? 600 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <Percent size={14} />
                Porcentaje
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("fixed")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "8px 10px",
                  borderRadius: "var(--radius-control)",
                  border:
                    discountType === "fixed"
                      ? "2px solid var(--dash-accent)"
                      : "1px solid var(--dash-border)",
                  background:
                    discountType === "fixed"
                      ? "var(--dash-accent-subtle)"
                      : "var(--dash-surface)",
                  color:
                    discountType === "fixed"
                      ? "var(--dash-accent)"
                      : "var(--dash-text)",
                  fontWeight: discountType === "fixed" ? 600 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <DollarSign size={14} />
                Monto Fijo
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
              className="admin-input"
            />
          </AdminField>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <AdminField label="Válido desde (opcional)">
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="admin-input"
            />
          </AdminField>

          <AdminField label="Válido hasta (opcional)">
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="admin-input"
            />
          </AdminField>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            background: "var(--dash-surface-elevated)",
            borderRadius: "var(--radius-control)",
            border: "1px solid var(--dash-border)",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)" }}>
              Cupón Habilitado
            </div>
            <div style={{ fontSize: 12, color: "var(--dash-text-muted)" }}>
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
