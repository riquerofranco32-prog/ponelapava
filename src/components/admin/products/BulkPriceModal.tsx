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
        <div className="flex justify-between items-center w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="admin-btn admin-btn--secondary text-xs"
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
                <Loader2 size={15} className="animate-spin mr-1.5" />
                {progress ? `Actualizando (${progress.current}/${progress.total})...` : "Aplicando..."}
              </>
            ) : (
              <>
                <Zap size={15} className="mr-1.5" />
                Aplicar a {targetProducts.length} producto{targetProducts.length === 1 ? "" : "s"}
              </>
            )}
          </AdminButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Scope Selector */}
        <div>
          <label className="text-xs font-semibold text-[var(--dash-text)] block mb-1.5">
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
          <label className="text-xs font-semibold text-[var(--dash-text)] block mb-1.5">
            2. Tipo de cambio:
          </label>
          <div className="flex gap-2 mb-2.5">
            <button
              type="button"
              onClick={() => setMode("percent")}
              className={`admin-toolbar-pill text-xs px-3 py-1.5 ${mode === "percent" ? " admin-toolbar-pill--active" : ""}`}
            >
              Porcentaje (%)
            </button>
            <button
              type="button"
              onClick={() => setMode("fixed")}
              className={`admin-toolbar-pill text-xs px-3 py-1.5 ${mode === "fixed" ? " admin-toolbar-pill--active" : ""}`}
            >
              Monto Fijo ($ ARS)
            </button>
          </div>

          {mode === "percent" ? (
            <div>
              {/* Quick Percent Presets */}
              <div className="flex gap-1.5 flex-wrap mb-2.5">
                {[5, 10, 15, 20, 25, 30, -10].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentValue(pct)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                      percentValue === pct
                        ? "border-[var(--dash-accent)] bg-[var(--dash-accent-subtle)] text-[var(--dash-accent)]"
                        : "border-[var(--dash-border)] bg-[var(--dash-surface-2)] text-[var(--dash-text)]"
                    }`}
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={1}
                  value={percentValue}
                  onChange={(e) => setPercentValue(Number(e.target.value))}
                  className="admin-input w-36"
                />
                <span className="text-xs text-[var(--dash-muted)]">
                  % {percentValue >= 0 ? "de aumento" : "de descuento"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--dash-accent)]">$</span>
              <input
                type="number"
                step={100}
                value={fixedValue}
                onChange={(e) => setFixedValue(Number(e.target.value))}
                className="admin-input w-40"
              />
              <span className="text-xs text-[var(--dash-muted)]">ARS por producto</span>
            </div>
          )}
        </div>

        {/* Rounding Mode */}
        <div>
          <label className="text-xs font-semibold text-[var(--dash-text)] block mb-1.5">
            3. Redondeo inteligente:
          </label>
          <div className="flex gap-2 flex-wrap">
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
                className={`text-xs px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                  rounding === opt.key
                    ? "border-[var(--dash-accent)] bg-[var(--dash-accent-subtle)] text-[var(--dash-accent)]"
                    : "border-[var(--dash-border)] bg-[var(--dash-surface-2)] text-[var(--dash-muted)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)]">
              Vista Previa en Vivo ({targetProducts.length} productos afectados)
            </span>
            <span className="text-xs text-[var(--dash-muted)]">
              Muestra primeros 6
            </span>
          </div>

          {previewProducts.length === 0 ? (
            <p className="text-xs text-[var(--dash-muted)] text-center py-2.5">
              No hay productos en la categoría seleccionada.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {previewProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-xs px-2 py-1.5 bg-[var(--dash-surface)] rounded-md border border-[var(--dash-border)]"
                >
                  <span className="font-semibold text-[var(--dash-text)] truncate max-w-[50%]">
                    {p.name}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[var(--dash-muted)] line-through text-xs">
                      {formatPrice(p.price)}
                    </span>
                    <ArrowRight size={12} className="text-[var(--dash-muted)]" />
                    <span className="font-bold text-[var(--dash-accent)]">
                      {formatPrice(p.newPrice)}
                    </span>
                    <span className={`text-xs font-semibold ${p.diff >= 0 ? "text-[var(--dash-success)]" : "text-[var(--dash-danger)]"}`}>
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
