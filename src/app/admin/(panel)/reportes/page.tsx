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
import { DollarSign, ShoppingCart, Receipt, Download } from "lucide-react";
import { DashboardStats as Stats } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import { AdminCard, AdminKpiCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
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

function exportReportsCsv(stats: Stats, days: number) {
  const lines: string[] = [
    `"Reporte de Ventas Poné La Pava - Últimos ${days} días"`,
    `"Fecha de generación","${new Date().toLocaleString("es-AR")}"`,
    `"Total Ingresos","${stats.totalRevenue}"`,
    `"Total Pedidos","${stats.orderCount}"`,
    `"Ticket Promedio","${stats.avgTicket}"`,
    "",
    `"Ventas por Día"`,
    `"Fecha","Total Ventas ($)"`,
    ...stats.salesByDay.map(
      (d) => `"${d.date}","${d.total}"`,
    ),
    "",
    `"Productos Más Vendidos"`,
    `"Producto","Unidades Vendidas"`,
    ...stats.topProducts.map((p) => `"${p.name.replace(/"/g, '""')}","${p.quantity}"`),
  ];

  const csv = lines.join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte-ventas-ponelapava-${days}dias-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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
    <div className="admin-page-reveal">
      {error && <AdminErrorBanner message={error} />}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
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

        {stats && (
          <AdminButton
            variant="secondary"
            onClick={() => exportReportsCsv(stats, days)}
            title="Descargar reporte en formato CSV / Excel"
          >
            <Download size={14} />
            Exportar CSV
          </AdminButton>
        )}
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
                  interval={2}
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

      {/* Grid: Payment & Delivery Methods Breakdown */}
      {stats && stats.orderCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Payment Methods */}
          <AdminCard>
            <h2 className="admin-section-title" style={{ marginBottom: 14 }}>
              💳 Métodos de Pago ({days} días)
            </h2>
            {(() => {
              const total = stats.orderCount || 1;
              const transf = stats.paymentMethods?.transfer || 0;
              const cash = stats.paymentMethods?.cash || 0;
              const card = stats.paymentMethods?.card || 0;

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>⚡ Transferencia Bancaria (10% OFF)</span>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>
                        {transf} ({Math.round((transf / total) * 100)}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: "var(--dash-surface-2)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(transf / total) * 100}%`, background: "#10b981", borderRadius: 4 }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>💵 Efectivo / Contraentrega</span>
                      <span style={{ color: "var(--dash-accent)", fontWeight: 700 }}>
                        {cash} ({Math.round((cash / total) * 100)}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: "var(--dash-surface-2)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(cash / total) * 100}%`, background: "var(--dash-accent)", borderRadius: 4 }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>💳 Tarjeta de Crédito / Débito</span>
                      <span style={{ color: "#60a5fa", fontWeight: 700 }}>
                        {card} ({Math.round((card / total) * 100)}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: "var(--dash-surface-2)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(card / total) * 100}%`, background: "#60a5fa", borderRadius: 4 }} />
                    </div>
                  </div>
                </div>
              );
            })()}
          </AdminCard>

          {/* Delivery Methods */}
          <AdminCard>
            <h2 className="admin-section-title" style={{ marginBottom: 14 }}>
              🚚 Formas de Entrega ({days} días)
            </h2>
            {(() => {
              const total = stats.orderCount || 1;
              const pickup = stats.deliveryMethods?.pickup || 0;
              const delivery = stats.deliveryMethods?.delivery || 0;

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>📦 Envío a Domicilio / Cadetería</span>
                      <span style={{ color: "var(--dash-accent)", fontWeight: 700 }}>
                        {delivery} ({Math.round((delivery / total) * 100)}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: "var(--dash-surface-2)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(delivery / total) * 100}%`, background: "linear-gradient(90deg, var(--dash-accent), #e2cead)", borderRadius: 4 }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>🏪 Retiro en Local / Tienda</span>
                      <span style={{ color: "#34d399", fontWeight: 700 }}>
                        {pickup} ({Math.round((pickup / total) * 100)}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: "var(--dash-surface-2)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(pickup / total) * 100}%`, background: "#34d399", borderRadius: 4 }} />
                    </div>
                  </div>
                </div>
              );
            })()}
          </AdminCard>
        </div>
      )}

      {/* Top Products */}
      {stats && stats.topProducts.length > 0 && (
        <AdminCard>
          <h2 className="admin-section-title" style={{ marginBottom: 14 }}>
            🏆 Más vendidos ({days} días)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(() => {
              const maxQty = stats.topProducts[0]?.quantity || 1;
              const medals = ["🥇", "🥈", "🥉"];

              return stats.topProducts.map((p, i) => (
                <div key={p.name}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: "var(--dash-text)", fontWeight: 600 }}>
                      <span style={{ marginRight: 8, fontSize: i < 3 ? 15 : 12 }}>
                        {i < 3 ? medals[i] : `${i + 1}.`}
                      </span>
                      {p.name}
                    </span>
                    <span style={{ color: "var(--dash-accent)", fontWeight: 700 }}>
                      {p.quantity} vendidos
                    </span>
                  </div>
                  <div style={{ height: 5, background: "var(--dash-surface-2)", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(p.quantity / maxQty) * 100}%`,
                        background: i === 0 ? "var(--dash-accent)" : "var(--dash-muted)",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </AdminCard>
      )}
    </div>
  );
}
