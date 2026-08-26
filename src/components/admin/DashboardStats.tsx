"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  PackageCheck,
  RefreshCw,
  CreditCard,
  Truck,
  Store,
  Clock,
  Sparkles,
} from "lucide-react";
import { DashboardStats as Stats } from "@/lib/orders";
import { formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/utils";
import { Product } from "@/types";
import { AdminCard, AdminKpiCard } from "./AdminCard";
import { KpiSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { StockStepper } from "./products/StockStepper";
import { SalesAreaChart } from "./SalesAreaChart";
import { RecentOrdersWidget } from "./orders/RecentOrdersWidget";
import { SalesGoalWidget } from "./dashboard/SalesGoalWidget";
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
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/stats");
      assertOk(res, "No se pudieron cargar las métricas");
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const timer = setInterval(() => fetchStats(true), 30_000);
    return () => clearInterval(timer);
  }, [fetchStats]);

  if (error) {
    return (
      <div className="admin-error-banner" style={{ marginBottom: 24 }}>
        {error}
      </div>
    );
  }

  const totalOrders = stats?.orderCount || 0;
  const transfCount = stats?.paymentMethods?.transfer || 0;
  const cashCount = stats?.paymentMethods?.cash || 0;
  const cardCount = stats?.paymentMethods?.card || 0;
  const pickupCount = stats?.deliveryMethods?.pickup || 0;
  const deliveryCount = stats?.deliveryMethods?.delivery || 0;

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Quick Dashboard Header Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--dash-muted)",
          }}
        >
          Métricas de Negocio (14 días)
        </span>
        <button
          onClick={() => fetchStats(false)}
          disabled={refreshing}
          className="admin-link-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--dash-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
          }}
        >
          <RefreshCw
            size={12}
            style={{
              animation: refreshing ? "spin 1s linear infinite" : "none",
            }}
          />
          <span>{refreshing ? "Actualizando..." : "Refrescar métricas"}</span>
        </button>
      </div>

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

      {/* Interactive Sales Goal Widget */}
      {stats && <SalesGoalWidget currentRevenue={stats.totalRevenue} />}

      {/* Real-time Recent Orders Section */}
      <RecentOrdersWidget onOrderUpdated={() => fetchStats(true)} />

      {/* Payment & Delivery Breakdown Insights */}
      {stats && totalOrders > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
          <AdminCard>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <CreditCard size={17} style={{ color: "var(--dash-accent)" }} />
              <h2 className="admin-section-title" style={{ margin: 0 }}>Medios de Pago</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--dash-text)" }}>💳 Transferencia (10% OFF)</span>
                <span style={{ fontWeight: 700, color: "#10b981" }}>
                  {transfCount} ({Math.round((transfCount / totalOrders) * 100)}%)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--dash-text)" }}>💵 Efectivo en Local</span>
                <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>
                  {cashCount} ({Math.round((cashCount / totalOrders) * 100)}%)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--dash-text)" }}>💳 Tarjetas / Otros</span>
                <span style={{ fontWeight: 600, color: "var(--dash-muted)" }}>
                  {cardCount} ({Math.round((cardCount / totalOrders) * 100)}%)
                </span>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Truck size={17} style={{ color: "var(--dash-accent)" }} />
              <h2 className="admin-section-title" style={{ margin: 0 }}>Modo de Entrega</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--dash-text)" }}>🏪 Retiro en Local Catriel</span>
                <span style={{ fontWeight: 700, color: "var(--dash-accent)" }}>
                  {pickupCount} ({Math.round((pickupCount / totalOrders) * 100)}%)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--dash-text)" }}>🛵 Envío a Domicilio</span>
                <span style={{ fontWeight: 600, color: "#3b82f6" }}>
                  {deliveryCount} ({Math.round((deliveryCount / totalOrders) * 100)}%)
                </span>
              </div>
            </div>
          </AdminCard>
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
          <h2 className="admin-section-title">Ranking de Más Vendidos (14 días)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {stats.topProducts.map((p, i) => {
              const maxQty = Math.max(...stats.topProducts.map((t) => t.quantity)) || 1;
              const barPct = Math.round((p.quantity / maxQty) * 100);

              return (
                <div key={p.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "var(--dash-text)", fontWeight: 500 }}>
                      <span
                        style={{
                          color: i === 0 ? "var(--dash-accent)" : "var(--dash-muted)",
                          fontWeight: 700,
                          marginRight: 8,
                        }}
                      >
                        #{i + 1}
                      </span>
                      {p.name}
                    </span>
                    <span style={{ color: "var(--dash-accent)", fontWeight: 600 }}>
                      {p.quantity} un.
                    </span>
                  </div>

                  <div
                    style={{
                      height: 6,
                      width: "100%",
                      borderRadius: 4,
                      background: "var(--dash-surface-2)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${barPct}%`,
                        background:
                          i === 0
                            ? "var(--dash-accent)"
                            : "var(--dash-surface-3)",
                        borderRadius: 4,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
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
