"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DollarSign, ShoppingCart, Receipt, PackageCheck } from "lucide-react";
import { DashboardStats as Stats } from "@/lib/orders";
import { formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/utils";
import { Product } from "@/types";
import { AdminCard, AdminKpiCard } from "./AdminCard";
import { KpiSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { StockStepper } from "./products/StockStepper";
import { assertOk } from "@/lib/admin-fetch";

function formatDayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

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

  const chartData =
    stats?.salesByDay.map((d) => ({ ...d, label: formatDayLabel(d.date) })) ??
    [];

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
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#c7a67a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#c7a67a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3a3324"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="#9c9280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9c9280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(v) =>
                    v === 0 ? "0" : `${Math.round(v / 1000)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e1b15",
                    border: "1px solid #3a3324",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#f3ede0" }}
                  formatter={(value) => [formatPrice(Number(value)), "Ventas"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#c7a67a"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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
      <h2 className="admin-section-title">Necesita reposición</h2>
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
