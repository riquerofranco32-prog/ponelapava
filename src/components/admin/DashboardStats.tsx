"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, ShoppingCart, Receipt, PackageCheck, RefreshCw } from "lucide-react";
import { DashboardStats as Stats } from "@/lib/orders";
import { formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/utils";
import { Product } from "@/types";
import { AdminCard, AdminKpiCard } from "./AdminCard";
import { KpiSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { StockStepper } from "./products/StockStepper";
import { SalesAreaChart } from "./SalesAreaChart";
import { RecentOrdersWidget } from "./orders/RecentOrdersWidget";
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

      {/* Sales Goal Widget */}
      {stats && (
        <AdminCard style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--dash-accent)",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                🎯 Meta Mensual de Facturación
              </span>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--dash-text)",
                }}
              >
                {formatPrice(stats.totalRevenue)}{" "}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--dash-muted)",
                  }}
                >
                  / objetivo $2.500.000
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "var(--dash-accent)",
                }}
              >
                {Math.min(100, Math.round((stats.totalRevenue / 2500000) * 100))}%
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "var(--dash-muted)",
                }}
              >
                alcanzado
              </span>
            </div>
          </div>

          <div
            style={{
              height: 10,
              width: "100%",
              borderRadius: 999,
              background: "var(--dash-surface-2)",
              overflow: "hidden",
              border: "1px solid var(--dash-border)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, Math.max(0, (stats.totalRevenue / 2500000) * 100))}%`,
                background:
                  "linear-gradient(90deg, var(--dash-accent), #10b981)",
                borderRadius: 999,
                transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
        </AdminCard>
      )}

      {/* Real-time Recent Orders Section */}
      <RecentOrdersWidget onOrderUpdated={() => fetchStats(true)} />

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
