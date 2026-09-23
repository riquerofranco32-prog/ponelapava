"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Clock,
  AlertCircle,
  Calendar,
  RefreshCw,
  ArrowRightLeft,
  Banknote,
  CreditCard,
  Truck,
  Store,
  PackageCheck,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { DashboardStats as Stats } from "@/lib/orders";
import { formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/utils";
import { Product } from "@/types";
import { AdminCard } from "./AdminCard";
import { StatCard } from "./ui/StatCard";
import { KpiSkeleton } from "./TableSkeleton";
import { EmptyState } from "./ui/EmptyState";
import { StockStepper } from "./products/StockStepper";
import { SalesAreaChart } from "./SalesAreaChart";
import { RecentOrdersWidget } from "./orders/RecentOrdersWidget";
import { SalesGoalWidget } from "./dashboard/SalesGoalWidget";
import { assertOk } from "@/lib/admin-fetch";
import { getPaymentMethodLabel } from "@/lib/orderPrint";

function kpiDelta(pct: number | null | undefined, label = "vs semana pasada") {
  if (pct === null || pct === undefined) return undefined;
  return {
    value: `${Math.abs(Math.round(pct))}%`,
    label,
    positive: pct >= 0,
    neutral: pct === 0,
  };
}

export default function DashboardStats({
  products,
  onStockChange,
}: {
  products: Product[];
  onStockChange: (product: Product, next: number) => Promise<void>;
}) {
  const router = useRouter();
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
      <div className="admin-error-banner mb-6">
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

  const lowStockCount = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;

  return (
    <div className="space-y-6 mb-8">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
            Panel de Operación · Hoy
          </span>
        </div>
        <button
          onClick={() => fetchStats(false)}
          disabled={refreshing}
          className="admin-btn admin-btn--secondary admin-btn--sm"
        >
          <RefreshCw
            size={13}
            className={refreshing ? "animate-spin text-[var(--dash-accent)]" : ""}
          />
          <span>{refreshing ? "Actualizando..." : "Refrescar"}</span>
        </button>
      </div>

      {/* 4 Primary StatCards requested in FASE 2.5 Requirement 5 */}
      {!stats ? (
        <KpiSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Ventas del día"
            value={formatPrice(stats.todayRevenue ?? 0)}
            delta={kpiDelta(stats.todayRevenueChange, "vs sem. anterior")}
            subtitle="Hoy en el local & web"
            icon={<DollarSign size={16} />}
          />

          <StatCard
            title="Pedidos pendientes"
            value={stats.pendingOrdersCount ?? 0}
            subtitle={
              (stats.pendingOrdersCount ?? 0) === 0
                ? "Al día sin pendientes"
                : "Requieren confirmación"
            }
            icon={<Clock size={16} />}
            onClick={() => router.push("/admin/pedidos?status=pending")}
          />

          <StatCard
            title="Sin cobrar"
            value={formatPrice(stats.totalUnpaidAmount ?? 0)}
            subtitle={
              (stats.unpaidOrdersCount ?? 0) > 0
                ? `${stats.unpaidOrdersCount} pedidos sin cobrar`
                : "Todos los pedidos cobrados"
            }
            icon={<AlertCircle size={16} />}
            onClick={() => router.push("/admin/pedidos?paymentStatus=unpaid")}
          />

          <StatCard
            title="Seguimientos vencidos"
            value={stats.overdueFollowupsCount ?? 0}
            subtitle={
              (stats.overdueFollowupsCount ?? 0) > 0
                ? "Clientes por contactar"
                : "Sin seguimientos vencidos"
            }
            icon={<Calendar size={16} />}
            onClick={() => router.push("/admin/clientes")}
          />
        </div>
      )}

      {/* Pending Actions List */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => router.push("/admin/pedidos?status=pending")}
            className="admin-card admin-card--interactive p-4 flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[var(--dash-warning-bg)] border border-[var(--dash-warning-border)] text-[var(--dash-warning)] flex items-center justify-center shrink-0">
                <Clock size={16} />
              </span>
              <div>
                <div className="text-sm font-semibold text-[var(--dash-text)]">
                  {stats.pendingOrdersCount ?? 0} pedidos pendientes
                </div>
                <div className="text-xs text-[var(--dash-muted)]">
                  Confirmar y comenzar preparación
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--dash-muted)] group-hover:text-[var(--dash-accent)] transition-colors" />
          </button>

          <button
            onClick={() => router.push("/admin/pedidos?paymentStatus=unpaid")}
            className="admin-card admin-card--interactive p-4 flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[var(--dash-danger-bg)] border border-[var(--dash-danger-border)] text-[var(--dash-danger)] flex items-center justify-center shrink-0">
                <AlertCircle size={16} />
              </span>
              <div>
                <div className="text-sm font-semibold text-[var(--dash-text)]">
                  {stats.unpaidOrdersCount ?? 0} pedidos sin cobrar
                </div>
                <div className="text-xs text-[var(--dash-muted)]">
                  Cobros pendientes ({formatPrice(stats.totalUnpaidAmount ?? 0)})
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--dash-muted)] group-hover:text-[var(--dash-accent)] transition-colors" />
          </button>

          <button
            onClick={() => router.push("/admin/productos")}
            className="admin-card admin-card--interactive p-4 flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[var(--dash-accent-bg)] border border-[var(--dash-accent-border)] text-[var(--dash-accent)] flex items-center justify-center shrink-0">
                <AlertTriangle size={16} />
              </span>
              <div>
                <div className="text-sm font-semibold text-[var(--dash-text)]">
                  {lowStockCount} con stock bajo
                </div>
                <div className="text-xs text-[var(--dash-muted)]">
                  Revisar reposición urgente
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--dash-muted)] group-hover:text-[var(--dash-accent)] transition-colors" />
          </button>
        </div>
      )}

      {/* Interactive Sales Goal Widget */}
      {stats && <SalesGoalWidget currentRevenue={stats.totalRevenue} />}

      {/* Real-time Recent Orders Section */}
      <RecentOrdersWidget onOrderUpdated={() => fetchStats(true)} />

      {/* Payment & Delivery Breakdown Insights (Strictly Lucide icons & tokens) */}
      {stats && totalOrders > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminCard>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={16} className="text-[var(--dash-accent)]" />
              <h2 className="admin-section-title mb-0">Medios de Pago</h2>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--dash-text)]">
                  <ArrowRightLeft size={14} className="text-[var(--dash-info)]" />
                  <span>{getPaymentMethodLabel("transfer")}</span>
                </span>
                <span className="font-bold text-[var(--dash-success)]">
                  {transfCount} ({Math.round((transfCount / totalOrders) * 100)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--dash-text)]">
                  <Banknote size={14} className="text-[var(--dash-success)]" />
                  <span>{getPaymentMethodLabel("cash")}</span>
                </span>
                <span className="font-semibold text-[var(--dash-text)]">
                  {cashCount} ({Math.round((cashCount / totalOrders) * 100)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--dash-text)]">
                  <CreditCard size={14} className="text-[var(--dash-accent)]" />
                  <span>{getPaymentMethodLabel("card")}</span>
                </span>
                <span className="font-semibold text-[var(--dash-muted)]">
                  {cardCount} ({Math.round((cardCount / totalOrders) * 100)}%)
                </span>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center gap-2 mb-3">
              <Truck size={16} className="text-[var(--dash-accent)]" />
              <h2 className="admin-section-title mb-0">Modo de Entrega</h2>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--dash-text)]">
                  <Store size={14} className="text-[var(--dash-accent)]" />
                  <span>Retiro en Local Catriel</span>
                </span>
                <span className="font-bold text-[var(--dash-accent)]">
                  {pickupCount} ({Math.round((pickupCount / totalOrders) * 100)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--dash-text)]">
                  <Truck size={14} className="text-[var(--dash-info)]" />
                  <span>Envío a Domicilio</span>
                </span>
                <span className="font-semibold text-[var(--dash-info)]">
                  {deliveryCount} ({Math.round((deliveryCount / totalOrders) * 100)}%)
                </span>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* 30-day Sales Chart */}
      <AdminCard>
        <h2 className="admin-section-title">Ventas últimos 30 días</h2>
        {stats && stats.orderCount === 0 ? (
          <p className="text-sm text-[var(--dash-muted)]">
            Todavía no hay pedidos registrados en este período.
          </p>
        ) : (
          <SalesAreaChart data={stats?.salesByDay ?? []} />
        )}
      </AdminCard>

      {/* Restock critical panel */}
      <RestockPanel
        products={products}
        fastMovers={stats?.topProducts ?? []}
        onStockChange={onStockChange}
      />

      {/* Fast Movers Ranking */}
      {stats && stats.topProducts.length > 0 && (
        <AdminCard>
          <h2 className="admin-section-title">Ranking de Más Vendidos</h2>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => {
              const maxQty = Math.max(...stats.topProducts.map((t) => t.quantity)) || 1;
              const barPct = Math.round((p.quantity / maxQty) * 100);

              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--dash-text)] font-medium">
                      <span className={`font-bold mr-2 ${i === 0 ? "text-[var(--dash-accent)]" : "text-[var(--dash-muted)]"}`}>
                        #{i + 1}
                      </span>
                      {p.name}
                    </span>
                    <span className="font-semibold text-[var(--dash-accent)]">
                      {p.quantity} un.
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-[var(--dash-surface-2)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        i === 0 ? "bg-[var(--dash-accent)]" : "bg-[var(--dash-surface-3)]"
                      }`}
                      style={{ width: `${barPct}%` }}
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
    <AdminCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="admin-section-title mb-0">
          Necesita reposición
        </h2>
        {needsRestock.length > 0 && (
          <span className="admin-badge admin-badge--danger text-xs font-semibold">
            {needsRestock.length}{" "}
            {needsRestock.length === 1 ? "producto crítico" : "productos críticos"}
          </span>
        )}
      </div>

      {needsRestock.length === 0 ? (
        <EmptyState
          icon={<PackageCheck size={28} />}
          title="Todo en orden"
          description="Ningún producto está agotado o con stock bajo."
        />
      ) : (
        <div className="space-y-2.5">
          {needsRestock.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 text-sm pb-2.5 border-b border-[var(--dash-border-subtle)]"
            >
              <span className="text-[var(--dash-text)] truncate flex items-center gap-2">
                {p.name}
                {fastMoverNames.has(p.name) && (
                  <span className="admin-badge admin-badge--warning text-xs uppercase tracking-wide">
                    se vende rápido
                  </span>
                )}
              </span>
              <div className="shrink-0">
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
