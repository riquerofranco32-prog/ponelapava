"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  MessageCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  Check,
  RotateCcw,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AdminKpiCard } from "../AdminCard";
import { TableSkeleton } from "../TableSkeleton";
import { EmptyState } from "../ui/EmptyState";
import { useAdminToast } from "../AdminToast";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { AbandonedCart, CartItem } from "@/types";
import { buildRecoveryWhatsAppMessage } from "@/lib/abandonedCarts";

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  if (diffMs < 0) return "Recién";
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Recién";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
}

const STEP_LABELS: Record<string, { label: string; variant: "neutral" | "warning" | "info" }> = {
  contact: { label: "1. Contacto", variant: "neutral" },
  delivery: { label: "2. Envío", variant: "warning" },
  payment: { label: "3. Pago", variant: "info" },
};

export default function AbandonedCartsTable() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "1h" | "24h" | "recovered">("pending");
  const [search, setSearch] = useState("");
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const showToast = useAdminToast();

  const fetchCarts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      let queryParam = "";
      if (filterMode === "pending") queryParam = "?recovered=false";
      else if (filterMode === "recovered") queryParam = "?recovered=true";
      else if (filterMode === "1h") queryParam = "?timeFilter=1h&recovered=false";
      else if (filterMode === "24h") queryParam = "?timeFilter=24h&recovered=false";

      const res = await fetch(`/api/admin/abandoned-carts${queryParam}`);
      if (!res.ok) {
        throw new Error("Error al obtener los carritos");
      }
      const data = await res.json();
      setCarts(data.carts || []);
    } catch (err) {
      console.error(err);
      showToast("No se pudieron cargar los carritos abandonados", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterMode, showToast]);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  const toggleRecovered = async (cart: AbandonedCart) => {
    setUpdatingId(cart.id);
    const nextState = !cart.recovered;
    try {
      const res = await fetch(`/api/admin/abandoned-carts/${cart.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recovered: nextState }),
      });
      if (!res.ok) throw new Error("Error al actualizar");

      setCarts((prev) =>
        prev.map((c) => (c.id === cart.id ? { ...c, recovered: nextState } : c))
      );
      if (selectedCart?.id === cart.id) {
        setSelectedCart((prev) => (prev ? { ...prev, recovered: nextState } : null));
      }
      showToast(
        nextState ? "Carrito marcado como recuperado" : "Carrito vuelto a pendientes",
        "success"
      );
    } catch {
      showToast("No se pudo actualizar el estado del carrito", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const pendingCarts = carts.filter((c) => !c.recovered);
    const recoveredCarts = carts.filter((c) => c.recovered);
    const totalCount = carts.length;
    const pendingAmount = pendingCarts.reduce((acc, c) => acc + (c.total || 0), 0);
    const recoveryRate = totalCount > 0 ? Math.round((recoveredCarts.length / totalCount) * 100) : 0;

    return {
      pendingCount: pendingCarts.length,
      pendingAmount,
      recoveredCount: recoveredCarts.length,
      recoveryRate,
    };
  }, [carts]);

  // Client-side search filtering
  const filteredCarts = useMemo(() => {
    if (!search.trim()) return carts;
    const q = search.toLowerCase().trim();
    return carts.filter((c) => {
      const nameMatch = c.customerName?.toLowerCase().includes(q);
      const phoneMatch = c.phone.includes(q);
      const itemMatch = c.items?.some((i) => i.product?.name?.toLowerCase().includes(q));
      return nameMatch || phoneMatch || itemMatch;
    });
  }, [carts, search]);

  const handleOpenWhatsApp = (cart: AbandonedCart) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ponelapava.com";
    const recoveryUrl = `${origin}/carrito?recover=${cart.id}`;
    const text = buildRecoveryWhatsAppMessage({
      customerName: cart.customerName,
      recoveryUrl,
    });
    const cleanPhone = cart.phone.replace(/\D/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--dash-text)] flex items-center gap-2">
            <ShoppingBag className="text-[var(--dash-accent)]" size={24} />
            Carritos Abandonados
          </h1>
          <p className="text-xs text-[var(--dash-muted)] mt-1">
            Detectá intenciones de compra no finalizadas y recuperalas con un mensaje directo de WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchCarts(true)}
            disabled={refreshing}
            loading={refreshing}
            icon={<RefreshCw size={14} />}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          label="Carritos pendientes"
          value={kpis.pendingCount}
          icon={AlertCircle}
        />
        <AdminKpiCard
          label="Monto recuperable"
          value={formatPrice(kpis.pendingAmount)}
          icon={TrendingUp}
        />
        <AdminKpiCard
          label="Carritos recuperados"
          value={kpis.recoveredCount}
          icon={CheckCircle2}
        />
        <AdminKpiCard
          label="Tasa de recuperación"
          value={`${kpis.recoveryRate}%`}
          icon={Percent}
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--dash-surface-1)] border border-[var(--dash-border)]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setFilterMode("pending")}
            className={`admin-toolbar-pill ${
              filterMode === "pending" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("1h")}
            className={`admin-toolbar-pill ${
              filterMode === "1h" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            &gt; 1 hora
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("24h")}
            className={`admin-toolbar-pill ${
              filterMode === "24h" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            &gt; 24 horas
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("recovered")}
            className={`admin-toolbar-pill ${
              filterMode === "recovered" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            Recuperados
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`admin-toolbar-pill ${
              filterMode === "all" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            Todos
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por cliente, tel o producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-9 py-1.5 text-xs w-full"
          />
        </div>
      </div>

      {/* Table / List */}
      <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-1)] overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : filteredCarts.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={<ShoppingBag size={28} />}
              title="No hay carritos abandonados"
              description={
                search
                  ? "No se encontraron carritos que coincidan con la búsqueda."
                  : filterMode === "pending"
                  ? "¡Excelente! No hay carritos pendientes en este momento."
                  : "No hay registros bajo este filtro."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--dash-text)]">
              <thead className="bg-[var(--dash-surface-2)] text-[var(--dash-muted)] font-medium border-b border-[var(--dash-border)]">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Productos</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Paso</th>
                  <th className="px-4 py-3">Inactivo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-border)]">
                {filteredCarts.map((cart) => {
                  const stepInfo = STEP_LABELS[cart.step] || {
                    label: cart.step,
                    variant: "neutral" as const,
                  };
                  const itemCount = cart.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;
                  const previewNames = cart.items
                    ?.map((i) => `${i.quantity}x ${i.product?.name}`)
                    .slice(0, 2)
                    .join(", ");
                  const hasMoreItems = (cart.items?.length || 0) > 2;

                  return (
                    <tr
                      key={cart.id}
                      className="hover:bg-[var(--dash-surface-2)]/50 transition-colors"
                    >
                      {/* Cliente */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--dash-text)]">
                          {cart.customerName || "Sin nombre"}
                        </div>
                        <div className="text-[11px] text-[var(--dash-muted)] flex items-center gap-1 mt-0.5">
                          <span>{cart.phone}</span>
                        </div>
                      </td>

                      {/* Productos */}
                      <td className="px-4 py-3 max-w-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedCart(cart)}
                          className="text-left group"
                        >
                          <div className="font-medium text-[var(--dash-text)] group-hover:text-[var(--dash-accent)] transition-colors line-clamp-1">
                            {previewNames || `${itemCount} productos`}
                            {hasMoreItems && ` +${cart.items.length - 2} más`}
                          </div>
                          <div className="text-[11px] text-[var(--dash-muted)] mt-0.5">
                            {itemCount} ítem{itemCount !== 1 ? "s" : ""} · Ver detalle
                          </div>
                        </button>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 font-semibold text-[var(--dash-text)]">
                        {formatPrice(cart.total)}
                      </td>

                      {/* Paso */}
                      <td className="px-4 py-3">
                        <Badge variant={stepInfo.variant}>
                          {stepInfo.label}
                        </Badge>
                      </td>

                      {/* Inactivo */}
                      <td className="px-4 py-3 text-[var(--dash-muted)] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>{formatRelativeTime(cart.lastActivity)}</span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3">
                        {cart.recovered ? (
                          <Badge variant="success">Recuperado</Badge>
                        ) : (
                          <Badge variant="warning">Pendiente</Badge>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenWhatsApp(cart)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-white font-medium text-xs transition-colors shadow-sm"
                            style={{ backgroundColor: "#25d366" }}
                            title="Recuperar pedido por WhatsApp"
                          >
                            <MessageCircle size={13} />
                            <span>Recuperar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleRecovered(cart)}
                            disabled={updatingId === cart.id}
                            className="p-1.5 rounded-lg border border-[var(--dash-border)] hover:bg-[var(--dash-surface-2)] text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors disabled:opacity-50"
                            title={
                              cart.recovered
                                ? "Marcar como pendiente"
                                : "Marcar como recuperado"
                            }
                          >
                            {cart.recovered ? (
                              <RotateCcw size={14} />
                            ) : (
                              <Check size={14} className="text-emerald-500" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cart Items Detail Modal */}
      {selectedCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--dash-surface-1)] border border-[var(--dash-border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--dash-border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--dash-text)]">
                  Detalle del Carrito
                </h3>
                <p className="text-xs text-[var(--dash-muted)]">
                  {selectedCart.customerName || "Sin nombre"} · {selectedCart.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCart(null)}
                className="p-1 rounded-lg hover:bg-[var(--dash-surface-2)] text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items list */}
            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 divide-y divide-[var(--dash-border)]">
              {selectedCart.items?.map((item: CartItem, idx: number) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex items-center gap-3">
                  {item.product?.images?.[0] ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[var(--dash-border)]">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[var(--dash-surface-2)] flex items-center justify-center shrink-0">
                      <ShoppingBag size={18} className="text-[var(--dash-muted)]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--dash-text)] truncate">
                      {item.product?.name || "Producto sin nombre"}
                    </p>
                    <p className="text-[11px] text-[var(--dash-muted)]">
                      {item.quantity} x {formatPrice(item.product?.price || 0)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold text-[var(--dash-text)]">
                      {formatPrice((item.product?.price || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total breakdown */}
            <div className="pt-3 border-t border-[var(--dash-border)] flex items-center justify-between text-xs">
              <span className="text-[var(--dash-muted)]">Total del pedido:</span>
              <span className="text-base font-bold text-[var(--dash-accent)]">
                {formatPrice(selectedCart.total)}
              </span>
            </div>

            {/* Action buttons in modal */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedCart(null)}
                className="flex-1"
              >
                Cerrar
              </Button>
              <button
                type="button"
                onClick={() => {
                  handleOpenWhatsApp(selectedCart);
                  setSelectedCart(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-white font-semibold text-xs transition-colors shadow-sm"
                style={{ backgroundColor: "#25d366" }}
              >
                <MessageCircle size={15} />
                <span>Contactar WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
