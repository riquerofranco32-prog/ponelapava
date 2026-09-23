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
    <div className="mb-6">
      {/* KPI Cards */}
      <div className="admin-kpi-grid mb-4">
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
      <AdminCard className="px-5 py-3.5">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-semibold text-[var(--dash-text)]">
            Salud del Inventario
          </span>
          <div className="flex gap-4 text-xs">
            <span className="text-[var(--dash-success)] inline-flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--dash-success)] inline-block" />
              Óptimo ({healthyPct}%)
            </span>
            <span className="text-[var(--dash-warning)] inline-flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--dash-warning)] inline-block" />
              Bajo ({lowPct}%)
            </span>
            <span className="text-[var(--dash-danger)] inline-flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--dash-danger)] inline-block" />
              Agotado ({outPct}%)
            </span>
          </div>
        </div>

        {/* Multi-segment bar */}
        <div className="h-2 w-full rounded-full bg-[var(--dash-surface-2)] overflow-hidden flex">
          <div
            style={{ width: `${healthyPct}%` }}
            className="bg-[var(--dash-success)] transition-[width] duration-500"
          />
          <div
            style={{ width: `${lowPct}%` }}
            className="bg-[var(--dash-warning)] transition-[width] duration-500"
          />
          <div
            style={{ width: `${outPct}%` }}
            className="bg-[var(--dash-danger)] transition-[width] duration-500"
          />
        </div>
      </AdminCard>
    </div>
  );
}
