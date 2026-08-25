"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Receipt, PackageCheck } from "lucide-react";
import { DashboardStats as Stats } from "@/lib/orders";
import { formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/utils";
import { Product } from "@/types";
import { AdminCard, AdminKpiCard } from "./AdminCard";
import { KpiSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { StockStepper } from "./products/StockStepper";
import { SalesAreaChart } from "./SalesAreaChart";
import { assertOk } from "@/lib/admin-fetch";

// Renders as AdminKpiCard's change/trend props, or nothing when there's no
// prior-period data to compare against (percentChange returned null).
function kpiDelta(pct: number | null) {
  if (pct === null) return {};
  return {
    change: `${Math.abs(Math.round(pct))}%`,
    trend: (pct >= 0 ? "up" : "down") as "up" | "down",
  };
}

export default function DashboardStats({
  products,
  onStockChange,
}: {
  products: Product[];
  onStockChange: (product: Product, next: number) => Promise<void>;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        assertOk(res, "No se pudieron cargar las métricas");
        return res.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="admin-error-banner" style={{ marginBottom: 24 }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 32 }}>
      {!stats ? (
        <KpiSkeleton count={3} />
      ) : (
        <div className="admin-kpi-grid">
          <AdminKpiCard
            icon={DollarSign}
            label="Ingresos (14 días)"
            value={formatPrice(stats.totalRevenue)}
            {...kpiDelta(stats.revenueChange)}
          />
          <AdminKpiCard
            icon={ShoppingCart}
            label="Pedidos (14 días)"
            value={stats.orderCount}
            {...kpiDelta(stats.orderCountChange)}
          />
          <AdminKpiCard
            icon={Receipt}
            label="Ticket promedio"
            value={formatPrice(stats.avgTicket)}
            {...kpiDelta(stats.avgTicketChange)}
          />
        </div>
      )}

      <AdminCard style={{ marginBottom: 20 }}>
        <h2 className="admin-section-title">Ventas últimos 14 días</h2>
        {stats && stats.orderCount === 0 ? (
          <p style={{ fontSize: 13, color: "var(--dash-muted)" }}>
            Todavía no hay pedidos registrados en este período.
          </p>
        ) : (
          <SalesAreaChart data={stats?.salesByDay ?? []} />
        )}
      </AdminCard>

      <RestockPanel
        products={products}
        fastMovers={stats?.topProducts ?? []}
        onStockChange={onStockChange}
      />

      {stats && stats.topProducts.length > 0 && (
        <AdminCard>
          <h2 className="admin-section-title">Más vendidos (14 días)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.topProducts.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--dash-text)" }}>
                  <span style={{ color: "var(--dash-muted)", marginRight: 8 }}>
                    {i + 1}.
                  </span>
                  {p.name}
                </span>
                <span style={{ color: "var(--dash-muted)" }}>
                  {p.quantity} vendidos
                </span>
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}

function RestockPanel({
  products,
  fastMovers,
  onStockChange,
}: {
  products: Product[];
  fastMovers: { name: string; quantity: number }[];
  onStockChange: (product: Product, next: number) => Promise<void>;
}) {
  const fastMoverNames = new Set(fastMovers.map((p) => p.name));
  const needsRestock = products
    .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);

  return (
    <AdminCard style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2 className="admin-section-title" style={{ margin: 0 }}>
          Necesita reposición
        </h2>
        {needsRestock.length > 0 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--dash-danger)",
              background: "var(--dash-danger-bg)",
              border: "1px solid var(--dash-danger-border)",
              borderRadius: "var(--radius-chip, 4px)",
              padding: "2px 8px",
            }}
          >
            {needsRestock.length}{" "}
            {needsRestock.length === 1
              ? "producto crítico"
              : "productos críticos"}
          </span>
        )}
      </div>
      {needsRestock.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="Todo en orden"
          description="Ningún producto está agotado o con stock bajo."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {needsRestock.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                fontSize: 13,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(243,237,224,0.08)",
              }}
            >
              <span
                style={{
                  color: "var(--dash-text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {p.name}
                {fastMoverNames.has(p.name) && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      color: "var(--dash-danger)",
                      background: "var(--dash-danger-bg)",
                      border: "1px solid var(--dash-danger-border)",
                      borderRadius: 999,
                      padding: "2px 8px",
                      flexShrink: 0,
                    }}
                  >
                    se vende rápido
                  </span>
                )}
              </span>
              <div style={{ flexShrink: 0 }}>
                <StockStepper
                  value={p.stock}
                  onChange={(next) => onStockChange(p, next)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminCard>
  );
}
