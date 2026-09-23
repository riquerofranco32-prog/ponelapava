"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Crown,
  Plus,
  Package,
  ShoppingCart,
  Tag,
  BarChart3,
  ExternalLink,
  Clock,
  Settings,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useAdminUser } from "@/context/AdminUserContext";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { getAdminHeaderScheduleBadge } from "@/lib/hours";
import type { SiteSettings } from "@/lib/settings";

interface OwnerExecutiveHeaderProps {
  products: Product[];
  onNewProductClick?: () => void;
}

export function OwnerExecutiveHeader({
  products,
  onNewProductClick,
}: OwnerExecutiveHeaderProps) {
  const { email, isOwner } = useAdminUser();
  const [clockTime, setClockTime] = useState<string>("");
  const [scheduleStatus, setScheduleStatus] = useState<{
    isOpen: boolean;
    label: string;
  }>({
    isOpen: true,
    label: "Local en línea",
  });
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [abandonedPendingCount, setAbandonedPendingCount] = useState<number>(0);
  const [recoverableAmount, setRecoverableAmount] = useState<number>(0);

  // Derive friendly owner name
  const ownerName = email.toLowerCase().includes("franco")
    ? "Franco"
    : email.split("@")[0] || "Administrador";

  // Clock in Buenos Aires / Catriel timezone
  useEffect(() => {
    function updateClock() {
      try {
        const now = new Date();
        const str = new Intl.DateTimeFormat("es-AR", {
          timeZone: "America/Argentina/Buenos_Aires",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now);
        setClockTime(str);
      } catch {
        // fallback
      }
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll schedule and pending counts
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        // Schedule
        const settingsRes = await fetch("/api/admin/settings");
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          const s = data.settings as SiteSettings | undefined;
          if (mounted && s) {
            const badge = getAdminHeaderScheduleBadge({
              openingHours: s.openingHours,
              closedDates: s.closedDates,
              hoursWeekday: s.hoursWeekday,
              hoursSaturday: s.hoursSaturday,
            });
            setScheduleStatus(badge);
          }
        }

        // Pending orders count
        const ordersRes = await fetch("/api/admin/orders/pending-count");
        if (ordersRes.ok) {
          const ordData = await ordersRes.json();
          if (mounted && typeof ordData.count === "number") {
            setPendingOrdersCount(ordData.count);
          }
        }

        // Abandoned carts metrics
        const cartsRes = await fetch("/api/admin/abandoned-carts?timeFilter=all");
        if (cartsRes.ok) {
          const cartData = await cartsRes.json();
          if (mounted && cartData.metrics) {
            setAbandonedPendingCount(cartData.metrics.pendingCount || 0);
            setRecoverableAmount(cartData.metrics.recoverableAmount || 0);
          }
        }
      } catch {
        // silent
      }
    }

    loadData();
    const timer = setInterval(loadData, 45_000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.minStock ?? 5)).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="mb-6 space-y-4">
      {/* ── TOP EXECUTIVE BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--dash-surface)] via-[var(--dash-surface-2)] to-[var(--dash-surface)] border border-[var(--dash-border)] p-4 sm:p-6 shadow-xl">
        {/* Subtle background ambient light */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-[var(--dash-accent)]/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Avatar + Greeting */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative shrink-0 w-12 h-12 rounded-xl bg-[var(--dash-surface-3)] border border-[var(--dash-accent-border)] flex items-center justify-center text-[var(--dash-accent)] shadow-md">
              <Crown size={24} className="text-[var(--dash-accent)]" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[var(--dash-success)] border-2 border-[var(--dash-surface)] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--dash-text)]">
                  ¡Hola {ownerName}! 👋
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] border border-[var(--dash-accent-border)]">
                  <Crown size={12} />
                  {isOwner ? "Propietario / Dueño" : "Staff"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--dash-muted)] mt-0.5">
                Panel de control en tiempo real · Poné La Pava Catriel
              </p>
            </div>
          </div>

          {/* Right: Local Status + Live Clock */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Store Status Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                scheduleStatus.isOpen
                  ? "bg-[var(--dash-success-bg)] text-[var(--dash-success)] border-[var(--dash-success-border)]"
                  : "bg-[var(--dash-warning-bg)] text-[var(--dash-warning)] border-[var(--dash-warning-border)]"
              }`}
            >
              <span
                className={`admin-live-dot ${
                  scheduleStatus.isOpen
                    ? "admin-live-dot--success"
                    : "admin-live-dot--warning"
                } w-2 h-2`}
              />
              <span className="truncate max-w-[170px] sm:max-w-none">
                {scheduleStatus.label}
              </span>
            </div>

            {/* Live Clock Pill */}
            {clockTime && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--dash-surface-3)]/60 border border-[var(--dash-border)] text-xs text-[var(--dash-text)] font-mono tabular-nums">
                <Clock size={13} className="text-[var(--dash-accent)]" />
                <span>{clockTime}</span>
              </div>
            )}

            {/* Quick Link to Store settings */}
            <Link
              href="/admin/configuracion"
              title="Configurar horarios y local"
              className="p-2 rounded-xl text-[var(--dash-muted)] hover:text-[var(--dash-text)] bg-[var(--dash-surface-2)] border border-[var(--dash-border)] hover:border-[var(--dash-accent)] transition-all"
            >
              <Settings size={15} />
            </Link>
          </div>
        </div>

        {/* ── OWNER QUICK ACTIONS GRID ── */}
        <div className="mt-5 pt-4 border-t border-[var(--dash-border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
              ⚡ Acciones Rápidas de Dueño
            </span>
            <Link
              href="/"
              target="_blank"
              className="text-xs text-[var(--dash-accent)] hover:underline flex items-center gap-1"
            >
              <span>Ver Tienda</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. Nuevo Producto */}
            <Link
              href="/admin/productos?action=new"
              onClick={onNewProductClick}
              className="admin-card admin-card--interactive p-3 flex flex-col items-center justify-center text-center gap-1.5 rounded-xl group hover:border-[var(--dash-accent)] transition-all"
            >
              <span className="w-8 h-8 rounded-lg bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={16} />
              </span>
              <span className="text-xs font-semibold text-[var(--dash-text)]">
                + Producto
              </span>
            </Link>

            {/* 2. Pedidos Pendientes */}
            <Link
              href="/admin/pedidos?status=pending"
              className="admin-card admin-card--interactive p-3 flex flex-col items-center justify-center text-center gap-1.5 rounded-xl group hover:border-[var(--dash-warning)] transition-all relative"
            >
              {pendingOrdersCount > 0 && (
                <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded-full bg-[var(--dash-warning)] text-[var(--dash-bg)] text-[10px] font-extrabold animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
              <span className="w-8 h-8 rounded-lg bg-[var(--dash-warning-bg)] text-[var(--dash-warning)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package size={16} />
              </span>
              <span className="text-xs font-semibold text-[var(--dash-text)]">
                Pedidos
              </span>
            </Link>

            {/* 3. Carritos Abandonados */}
            <Link
              href="/admin/carritos"
              className="admin-card admin-card--interactive p-3 flex flex-col items-center justify-center text-center gap-1.5 rounded-xl group hover:border-[var(--dash-danger)] transition-all relative"
            >
              {abandonedPendingCount > 0 && (
                <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded-full bg-[var(--dash-danger)] text-[var(--dash-bg)] text-[10px] font-extrabold">
                  {abandonedPendingCount}
                </span>
              )}
              <span className="w-8 h-8 rounded-lg bg-[var(--dash-danger-bg)] text-[var(--dash-danger)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart size={16} />
              </span>
              <span className="text-xs font-semibold text-[var(--dash-text)]">
                Carritos
              </span>
            </Link>

            {/* 4. Cupones & Promociones */}
            <Link
              href="/admin/cupones"
              className="admin-card admin-card--interactive p-3 flex flex-col items-center justify-center text-center gap-1.5 rounded-xl group hover:border-[var(--dash-accent)] transition-all"
            >
              <span className="w-8 h-8 rounded-lg bg-[var(--dash-surface-3)] text-[var(--dash-accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Tag size={16} />
              </span>
              <span className="text-xs font-semibold text-[var(--dash-text)]">
                Cupones
              </span>
            </Link>

            {/* 5. Reportes & Finanzas */}
            <Link
              href="/admin/reportes"
              className="admin-card admin-card--interactive p-3 flex flex-col items-center justify-center text-center gap-1.5 rounded-xl group hover:border-[var(--dash-info)] transition-all"
            >
              <span className="w-8 h-8 rounded-lg bg-[var(--dash-info-bg)] text-[var(--dash-info)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 size={16} />
              </span>
              <span className="text-xs font-semibold text-[var(--dash-text)]">
                Reportes
              </span>
            </Link>

            {/* 6. Reposición de Stock */}
            <Link
              href="/admin/productos?stock=low"
              className="admin-card admin-card--interactive p-3 flex flex-col items-center justify-center text-center gap-1.5 rounded-xl group hover:border-[var(--dash-warning)] transition-all relative"
            >
              {(lowStockCount > 0 || outOfStockCount > 0) && (
                <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded-full bg-[var(--dash-warning)] text-[var(--dash-bg)] text-[10px] font-extrabold">
                  {lowStockCount + outOfStockCount}
                </span>
              )}
              <span className="w-8 h-8 rounded-lg bg-[var(--dash-surface-3)] text-[var(--dash-warning)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle size={16} />
              </span>
              <span className="text-xs font-semibold text-[var(--dash-text)]">
                Stock Bajo
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── RECOVERABLE CARTS OPPORTUNITY ALERT (IF ANY) ── */}
      {abandonedPendingCount > 0 && recoverableAmount > 0 && (
        <div className="bg-gradient-to-r from-[var(--dash-danger-bg)] to-[var(--dash-surface)] border border-[var(--dash-danger-border)] rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-[var(--dash-danger-bg)] text-[var(--dash-danger)] flex items-center justify-center shrink-0">
              <ShoppingCart size={18} />
            </span>
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[var(--dash-text)] flex items-center gap-2">
                <span>Oportunidad de Venta: {abandonedPendingCount} carritos sin finalizar</span>
                <span className="text-xs font-bold text-[var(--dash-danger)]">
                  ({formatPrice(recoverableAmount)})
                </span>
              </div>
              <p className="text-xs text-[var(--dash-muted)]">
                Enviá un recordatorio de WhatsApp a los clientes antes de que se enfríen.
              </p>
            </div>
          </div>

          <Link
            href="/admin/carritos"
            className="admin-btn admin-btn--secondary admin-btn--sm self-end sm:self-center"
          >
            <span>Recuperar Carritos</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default OwnerExecutiveHeader;
