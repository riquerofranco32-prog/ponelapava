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
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  Download,
  CreditCard,
  Zap,
  Banknote,
  Truck,
  Package,
  Store,
  Trophy,
} from "lucide-react";
import { DashboardStats as Stats } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import { AdminCard, AdminKpiCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { KpiSkeleton } from "@/components/admin/TableSkeleton";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { SalesAreaChart } from "@/components/admin/SalesAreaChart";
import { assertOk } from "@/lib/admin-fetch";
import { getPaymentMethodLabel } from "@/lib/orderPrint";

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

      <div className="flex justify-between items-center flex-wrap gap-2.5 mb-5">
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className="admin-nav-item text-xs px-3.5 py-1.5 w-auto"
              aria-current={days === r.days ? "page" : undefined}
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

      <AdminCard className="mb-5">
        <h2 className="admin-section-title">Ventas ({days} días)</h2>
        {stats && stats.orderCount === 0 ? (
          <p className="text-xs text-[var(--dash-muted)]">
            Todavía no hay pedidos registrados en este período.
          </p>
        ) : (
          <SalesAreaChart data={stats?.salesByDay ?? []} />
        )}
      </AdminCard>

      <AdminCard className="mb-5">
        <h2 className="admin-section-title">
          Pedidos por hora del día
          {peakHour && peakHour.orders > 0 && (
            <span className="ml-2.5 text-xs font-medium text-[var(--dash-muted)]">
              — pico: {peakHour.hour}:00hs
            </span>
          )}
        </h2>
        {stats && stats.orderCount === 0 ? (
          <p className="text-xs text-[var(--dash-muted)]">
            Todavía no hay pedidos registrados en este período.
          </p>
        ) : (
          <div className="w-full h-52">
            <ResponsiveContainer>
              <BarChart data={stats?.peakHours ?? []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--dash-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  stroke="var(--dash-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(h) => `${h}h`}
                  interval={2}
                />
                <YAxis
                  stroke="var(--dash-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--dash-surface-elevated)",
                    border: "1px solid var(--dash-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--dash-text)" }}
                  labelFormatter={(h) => `${h}:00hs`}
                  formatter={(value) => [value, "Pedidos"]}
                />
                <Bar dataKey="orders" fill="var(--dash-accent)" radius={[4, 4, 0, 0]} />
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
            <h2 className="admin-section-title flex items-center gap-2 mb-3.5">
              <CreditCard size={16} className="text-[var(--dash-accent)]" />
              <span>Métodos de Pago ({days} días)</span>
            </h2>
            {(() => {
              const total = stats.orderCount || 1;
              const transf = stats.paymentMethods?.transfer || 0;
              const cash = stats.paymentMethods?.cash || 0;
              const card = stats.paymentMethods?.card || 0;

              return (
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--dash-text)] flex items-center gap-1.5">
                        <Zap size={13} className="text-[var(--dash-success)]" />
                        {getPaymentMethodLabel("transfer")}
                      </span>
                      <span className="text-[var(--dash-success)] font-bold">
                        {transf} ({Math.round((transf / total) * 100)}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--dash-surface-2)] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(transf / total) * 100}%` }}
                        className="h-full bg-[var(--dash-success)] rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--dash-text)] flex items-center gap-1.5">
                        <Banknote size={13} className="text-[var(--dash-accent)]" />
                        {getPaymentMethodLabel("cash")}
                      </span>
                      <span className="text-[var(--dash-accent)] font-bold">
                        {cash} ({Math.round((cash / total) * 100)}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--dash-surface-2)] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(cash / total) * 100}%` }}
                        className="h-full bg-[var(--dash-accent)] rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--dash-text)] flex items-center gap-1.5">
                        <CreditCard size={13} className="text-[var(--dash-info)]" />
                        {getPaymentMethodLabel("card")}
                      </span>
                      <span className="text-[var(--dash-info)] font-bold">
                        {card} ({Math.round((card / total) * 100)}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--dash-surface-2)] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(card / total) * 100}%` }}
                        className="h-full bg-[var(--dash-info)] rounded-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </AdminCard>

          {/* Delivery Methods */}
          <AdminCard>
            <h2 className="admin-section-title flex items-center gap-2 mb-3.5">
              <Truck size={16} className="text-[var(--dash-accent)]" />
              <span>Formas de Entrega ({days} días)</span>
            </h2>
            {(() => {
              const total = stats.orderCount || 1;
              const pickup = stats.deliveryMethods?.pickup || 0;
              const delivery = stats.deliveryMethods?.delivery || 0;

              return (
                <div className="flex flex-col gap-3.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--dash-text)] flex items-center gap-1.5">
                        <Package size={13} className="text-[var(--dash-accent)]" />
                        Envío a Domicilio / Cadetería
                      </span>
                      <span className="text-[var(--dash-accent)] font-bold">
                        {delivery} ({Math.round((delivery / total) * 100)}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--dash-surface-2)] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(delivery / total) * 100}%` }}
                        className="h-full bg-[var(--dash-accent)] rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--dash-text)] flex items-center gap-1.5">
                        <Store size={13} className="text-[var(--dash-success)]" />
                        Retiro en Local / Tienda
                      </span>
                      <span className="text-[var(--dash-success)] font-bold">
                        {pickup} ({Math.round((pickup / total) * 100)}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--dash-surface-2)] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(pickup / total) * 100}%` }}
                        className="h-full bg-[var(--dash-success)] rounded-full"
                      />
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
          <h2 className="admin-section-title flex items-center gap-2 mb-3.5">
            <Trophy size={16} className="text-[var(--dash-accent)]" />
            <span>Más vendidos ({days} días)</span>
          </h2>
          <div className="flex flex-col gap-3">
            {(() => {
              const maxQty = stats.topProducts[0]?.quantity || 1;

              return stats.topProducts.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[var(--dash-text)] font-semibold flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--dash-surface-3)] border border-[var(--dash-border)] flex items-center justify-center text-xs font-bold text-[var(--dash-muted)]">
                        {i + 1}
                      </span>
                      <span>{p.name}</span>
                    </span>
                    <span className="text-[var(--dash-accent)] font-bold">
                      {p.quantity} vendidos
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--dash-surface-2)] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(p.quantity / maxQty) * 100}%` }}
                      className={`h-full rounded-full ${
                        i === 0 ? "bg-[var(--dash-accent)]" : "bg-[var(--dash-muted)]"
                      }`}
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
