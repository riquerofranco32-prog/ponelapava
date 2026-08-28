"use client";

import { useState, useMemo } from "react";
import { Zap, AlertTriangle, Check, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { Product, Category } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminButton } from "@/components/admin/AdminButton";
import { useAdminToast } from "@/components/admin/AdminToast";
import { assertOk } from "@/lib/admin-fetch";

interface BulkPriceModalProps {
  products: Product[];
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

type RoundingMode = "none" | "100" | "500" | "1000";

export function BulkPriceModal({
  products,
  categories,
  onClose,
  onSuccess,
}: BulkPriceModalProps) {
  const [targetCategory, setTargetCategory] = useState<string>("all");
  const [mode, setMode] = useState<"percent" | "fixed">("percent");
  const [percentValue, setPercentValue] = useState<number>(10);
  const [fixedValue, setFixedValue] = useState<number>(1000);
  const [rounding, setRounding] = useState<RoundingMode>("100");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const showToast = useAdminToast();

  // Filter products by selected target category
  const targetProducts = useMemo(() => {
    if (targetCategory === "all") return products;
    return products.filter((p) => p.category === targetCategory);
  }, [products, targetCategory]);

  // Compute preview for a given product price
  function calculateNewPrice(currentPrice: number): number {
    let raw = currentPrice;
    if (mode === "percent") {
      raw = currentPrice * (1 + percentValue / 100);
    } else {
      raw = currentPrice + fixedValue;
    }

    if (raw <= 0) return 0;

    if (rounding === "100") {
      return Math.round(raw / 100) * 100;
    } else if (rounding === "500") {
      return Math.round(raw / 500) * 500;
    } else if (rounding === "1000") {
      return Math.round(raw / 1000) * 1000;
    }
    return Math.round(raw);
  }

  // Previews of the first 5 affected products
  const previewProducts = useMemo(() => {
    return targetProducts.slice(0, 6).map((p) => {
      const newPrice = calculateNewPrice(p.price);
      return {
        ...p,
        newPrice,
        diff: newPrice - p.price,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetProducts, mode, percentValue, fixedValue, rounding]);

  async function handleApply() {
    if (targetProducts.length === 0) return;
    setSaving(true);
    setProgress({ current: 0, total: targetProducts.length });

    try {
      let count = 0;
      let updated = 0;
      for (const product of targetProducts) {
        const newPrice = calculateNewPrice(product.price);
        if (newPrice !== product.price) {
          const { id, createdAt: _c, ...rest } = product;
          const res = await fetch(`/api/admin/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...rest,
              price: newPrice,
            }),
          });
          // Each PUT is checked: without this the loop reported "N productos
          // actualizados" even when every request came back 401 or 500.
          assertOk(res, `No se pudo actualizar "${product.name}"`);
          updated++;
        }
        count++;
        setProgress({ current: count, total: targetProducts.length });
      }

      showToast(
        updated === 0
          ? "Ningún precio cambió con ese ajuste"
          : `¡Se actualizaron ${updated} producto${updated === 1 ? "" : "s"} con éxito!`,
      );
      onSuccess();
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al aplicar ajuste masivo",
        "error",
      );
      // Some rows may have gone through before the failure — refetch so the
      // table shows the real state instead of a half-applied guess.
      onSuccess();
    } finally {
      setSaving(false);
      setProgress(null);
    }
  }

  return (
    <AdminModal
      title="Ajuste Masivo de Precios"
      onClose={saving ? () => {} : onClose}
      maxWidth={600}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="admin-btn admin-btn--secondary"
            style={{ fontSize: 13 }}
          >
            Cancelar
          </button>

          <AdminButton
            variant="primary"
            onClick={handleApply}
            disabled={saving || targetProducts.length === 0}
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" style={{ marginRight: 6 }} />
                {progress ? `Actualizando (${progress.current}/${progress.total})...` : "Aplicando..."}
              </>
            ) : (
              <>
                <Zap size={15} style={{ marginRight: 6 }} />
                Aplicar a {targetProducts.length} producto{targetProducts.length === 1 ? "" : "s"}
              </>
            )}
          </AdminButton>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Scope Selector */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", display: "block", marginBottom: 6 }}>
            1. Alcance del ajuste:
          </label>
          <select
            value={targetCategory}
            onChange={(e) => setTargetCategory(e.target.value)}
            disabled={saving}
            className="admin-input"
          >
            <option value="all">Todo el catálogo ({products.length} productos)</option>
            {categories.map((c) => {
              const count = products.filter((p) => p.category === c.slug).length;
              return (
                <option key={c.id} value={c.slug}>
                  Categoría: {c.name} ({count} productos)
                </option>
              );
            })}
          </select>
        </div>

        {/* Method & Preset Percentages */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", display: "block", marginBottom: 6 }}>
            2. Tipo de cambio:
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setMode("percent")}
              className={`admin-toolbar-pill${mode === "percent" ? " admin-toolbar-pill--active" : ""}`}
              style={{ fontSize: 12, padding: "6px 12px" }}
            >
              Porcentaje (%)
            </button>
            <button
              type="button"
              onClick={() => setMode("fixed")}
              className={`admin-toolbar-pill${mode === "fixed" ? " admin-toolbar-pill--active" : ""}`}
              style={{ fontSize: 12, padding: "6px 12px" }}
            >
              Monto Fijo ($ ARS)
            </button>
          </div>

          {mode === "percent" ? (
            <div>
              {/* Quick Percent Presets */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {[5, 10, 15, 20, 25, 30, -10].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentValue(pct)}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: percentValue === pct ? "1px solid var(--dash-accent)" : "1px solid var(--dash-border)",
                      background: percentValue === pct ? "var(--dash-accent-subtle)" : "var(--dash-surface-2)",
                      color: percentValue === pct ? "var(--dash-accent)" : "var(--dash-text)",
                      cursor: "pointer",
                    }}
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  step={1}
                  value={percentValue}
                  onChange={(e) => setPercentValue(Number(e.target.value))}
                  className="admin-input"
                  style={{ width: 140 }}
                />
                <span style={{ fontSize: 13, color: "var(--dash-muted)" }}>
                  % {percentValue >= 0 ? "de aumento" : "de descuento"}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-accent)" }}>$</span>
              <input
                type="number"
                step={100}
                value={fixedValue}
                onChange={(e) => setFixedValue(Number(e.target.value))}
                className="admin-input"
                style={{ width: 160 }}
              />
              <span style={{ fontSize: 13, color: "var(--dash-muted)" }}>ARS por producto</span>
            </div>
          )}
        </div>

        {/* Rounding Mode */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", display: "block", marginBottom: 6 }}>
            3. Redondeo inteligente:
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "100", label: "Redondear a $100 (Recomendado)" },
              { key: "500", label: "Redondear a $500" },
              { key: "1000", label: "Redondear a $1.000" },
              { key: "none", label: "Sin redondeo" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setRounding(opt.key as RoundingMode)}
                style={{
                  fontSize: 12,
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: rounding === opt.key ? "1px solid var(--dash-accent)" : "1px solid var(--dash-border)",
                  background: rounding === opt.key ? "var(--dash-accent-subtle)" : "var(--dash-surface-2)",
                  color: rounding === opt.key ? "var(--dash-accent)" : "var(--dash-muted)",
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview Card */}
        <div
          style={{
            background: "var(--dash-surface-2)",
            border: "1px solid var(--dash-border)",
            borderRadius: 10,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--dash-accent)" }}>
              Vista Previa en Vivo ({targetProducts.length} productos afectados)
            </span>
            <span style={{ fontSize: 11, color: "var(--dash-muted)" }}>
              Muestra primeros 6
            </span>
          </div>

          {previewProducts.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--dash-muted)", textAlign: "center", padding: "10px 0" }}>
              No hay productos en la categoría seleccionada.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {previewProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "6px 8px",
                    background: "var(--dash-surface)",
                    borderRadius: 6,
                    border: "1px solid var(--dash-border)",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--dash-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "50%" }}>
                    {p.name}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--dash-muted)", textDecoration: "line-through", fontSize: 12 }}>
                      {formatPrice(p.price)}
                    </span>
                    <ArrowRight size={12} style={{ color: "var(--dash-muted)" }} />
                    <span style={{ fontWeight: 700, color: "var(--dash-accent)" }}>
                      {formatPrice(p.newPrice)}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: p.diff >= 0 ? "#10b981" : "#ef4444" }}>
                      ({p.diff >= 0 ? `+${formatPrice(p.diff)}` : formatPrice(p.diff)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminModal>
  );
}
