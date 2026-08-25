"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DollarSign, ShoppingCart, Receipt } from "lucide-react";
import { DashboardStats as Stats } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import { AdminCard, AdminKpiCard } from "@/components/admin/AdminCard";
import { KpiSkeleton } from "@/components/admin/TableSkeleton";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { SalesAreaChart } from "@/components/admin/SalesAreaChart";
import { assertOk } from "@/lib/admin-fetch";

const RANGES = [
  { days: 7, label: "7 días" },
  { days: 30, label: "30 días" },
  { days: 90, label: "90 días" },
] as const;

function kpiDelta(pct: number | null) {
  if (pct === null) return {};
  return {
    change: `${Math.abs(Math.round(pct))}%`,
    trend: (pct >= 0 ? "up" : "down") as "up" | "down",
  };
}

export default function AdminReportesPage() {
  const [days, setDays] = useState<number>(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reports?days=${days}`)
      .then((res) => {
        assertOk(res, "No se pudieron cargar los reportes");
        return res.json();
      })
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error desconocido"),
      )
      .finally(() => setLoading(false));
  }, [days]);

  const peakHour = stats?.peakHours.reduce(
    (best, h) => (h.orders > best.orders ? h : best),
    { hour: 0, orders: 0 },
  );

  return (
    <div>
      {error && <AdminErrorBanner message={error} />}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => setDays(r.days)}
            className="admin-nav-item"
            aria-current={days === r.days ? "page" : undefined}
            style={{ padding: "6px 14px", width: "auto" }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading || !stats ? (
        <KpiSkeleton count={3} />
      ) : (
        <div className="admin-kpi-grid">
          <AdminKpiCard
            icon={DollarSign}
            label={`Ingresos (${days} días)`}
            value={formatPrice(stats.totalRevenue)}
            {...kpiDelta(stats.revenueChange)}
          />
          <AdminKpiCard
            icon={ShoppingCart}
            label={`Pedidos (${days} días)`}
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
        <h2 className="admin-section-title">Ventas ({days} días)</h2>
        {stats && stats.orderCount === 0 ? (
          <p style={{ fontSize: 13, color: "var(--dash-muted)" }}>
            Todavía no hay pedidos registrados en este período.
          </p>
        ) : (
          <SalesAreaChart data={stats?.salesByDay ?? []} />
        )}
      </AdminCard>

      <AdminCard style={{ marginBottom: 20 }}>
        <h2 className="admin-section-title">
          Pedidos por hora del día
          {peakHour && peakHour.orders > 0 && (
            <span
              style={{
                marginLeft: 10,
                fontSize: 12,
                fontWeight: 500,
                color: "var(--dash-muted)",
              }}
            >
              — pico: {peakHour.hour}:00hs
            </span>
          )}
        </h2>
        {stats && stats.orderCount === 0 ? (
          <p style={{ fontSize: 13, color: "var(--dash-muted)" }}>
            Todavía no hay pedidos registrados en este período.
          </p>
        ) : (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={stats?.peakHours ?? []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3a3324"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  stroke="#9c9280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(h) => `${h}h`}
                  interval={1}
                />
                <YAxis
                  stroke="#9c9280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e1b15",
                    border: "1px solid #3a3324",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#f3ede0" }}
                  labelFormatter={(h) => `${h}:00hs`}
                  formatter={(value) => [value, "Pedidos"]}
                />
                <Bar dataKey="orders" fill="#c7a67a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminCard>

      {stats && stats.topProducts.length > 0 && (
        <AdminCard>
          <h2 className="admin-section-title">Más vendidos ({days} días)</h2>
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
