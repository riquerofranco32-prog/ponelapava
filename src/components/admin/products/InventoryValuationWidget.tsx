"use client";

import { Boxes, Coins, AlertTriangle, CheckCircle2, PackageX, TrendingUp } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/utils";
import { AdminCard, AdminKpiCard } from "@/components/admin/AdminCard";

interface InventoryValuationWidgetProps {
  products: Product[];
}

export function InventoryValuationWidget({ products }: InventoryValuationWidgetProps) {
  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValuation = products.reduce(
    (acc, p) => acc + (p.stock || 0) * (p.price || 0),
    0,
  );

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD,
  ).length;
  const healthyStock = products.filter((p) => p.stock > LOW_STOCK_THRESHOLD).length;

  const totalProducts = products.length || 1;
  const healthyPct = Math.round((healthyStock / totalProducts) * 100);
  const lowPct = Math.round((lowStock / totalProducts) * 100);
  const outPct = Math.round((outOfStock / totalProducts) * 100);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* KPI Cards */}
      <div className="admin-kpi-grid" style={{ marginBottom: 16 }}>
        <AdminKpiCard
          icon={Coins}
          label="Valor del Inventario (Venta)"
          value={formatPrice(totalValuation)}
        />
        <AdminKpiCard
          icon={Boxes}
          label="Unidades Totales en Stock"
          value={`${totalUnits} un.`}
        />
        <AdminKpiCard
          icon={AlertTriangle}
          label="Stock Crítico (≤ 3 un.)"
          value={`${lowStock} productos`}
        />
      </div>

      {/* Stock Health Progress Bar */}
      <AdminCard style={{ padding: "14px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            fontSize: 12,
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>
            Salud del Inventario
          </span>
          <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
            <span style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              Óptimo ({healthyPct}%)
            </span>
            <span style={{ color: "#f59e0b", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
              Bajo ({lowPct}%)
            </span>
            <span style={{ color: "#ef4444", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              Agotado ({outPct}%)
            </span>
          </div>
        </div>

        {/* Multi-segment bar */}
        <div
          style={{
            height: 8,
            width: "100%",
            borderRadius: 999,
            background: "var(--dash-surface-2)",
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${healthyPct}%`,
              background: "#10b981",
              transition: "width 0.5s ease",
            }}
          />
          <div
            style={{
              width: `${lowPct}%`,
              background: "#f59e0b",
              transition: "width 0.5s ease",
            }}
          />
          <div
            style={{
              width: `${outPct}%`,
              background: "#ef4444",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </AdminCard>
    </div>
  );
}
