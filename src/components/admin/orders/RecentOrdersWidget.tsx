"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Eye,
  MessageCircle,
  AlertCircle,
  Truck,
  Store,
  ArrowRightLeft,
  Tag,
} from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/orderStatus";
import { buildAdminCustomerWhatsAppUrl } from "@/lib/whatsapp";
import { AdminCard } from "../AdminCard";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { OrderDetailModal } from "./OrderDetailModal";
import { useAdminToast } from "../AdminToast";
import { assertOk } from "@/lib/admin-fetch";
import { StatusPill } from "../ui/Badge";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMin / 60);

  if (diffMin < 1) return "Recién ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentOrdersWidget({
  onOrderUpdated,
}: {
  onOrderUpdated?: () => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const showToast = useAdminToast();

  async function fetchRecentOrders(silent = false) {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/orders");
      assertOk(res, "No se pudieron cargar los pedidos");
      const json = await res.json();
      const data: Order[] = Array.isArray(json) ? json : (json?.orders ?? []);
      setOrders(data);
    } catch (err) {
      if (!silent) {
        showToast(
          err instanceof Error ? err.message : "Error al actualizar pedidos",
          "error"
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchRecentOrders();
    const interval = setInterval(() => {
      fetchRecentOrders(true);
    }, 20_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStatusChange(id: string, status: Order["status"]) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      assertOk(res, "No se pudo actualizar el estado");
      showToast(`Pedido marcado como ${STATUS_LABELS[status].toLowerCase()}`);
      onOrderUpdated?.();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al actualizar",
        "error"
      );
      fetchRecentOrders(true);
    }
  }

  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "delivered"
  >("all");
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);
  const recentOrders = filteredOrders.slice(0, 6);

  return (
    <div className="space-y-4 mb-6">
      {/* Pending Orders Action Banner */}
      {pendingOrders.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--dash-warning-bg)] border border-[var(--dash-warning-border)] text-[var(--dash-text)]">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-[var(--dash-warning)] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">
              Tenés{" "}
              <strong className="text-[var(--dash-warning)]">
                {pendingOrders.length} pedido{pendingOrders.length !== 1 ? "s" : ""}{" "}
                pendiente{pendingOrders.length !== 1 ? "s" : ""}
              </strong>{" "}
              por confirmar o despachar.
            </span>
          </div>
          <Link
            href="/admin/pedidos"
            className="text-xs font-bold text-[var(--dash-warning)] hover:underline inline-flex items-center gap-1"
          >
            <span>Gestionar pedidos</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Recent Orders Card */}
      <AdminCard>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="admin-section-title mb-0">Pedidos Recientes</h2>
            {orders.length > 0 && (
              <span className="admin-badge admin-badge--neutral text-xs">
                {orders.length} totales
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchRecentOrders()}
              disabled={refreshing}
              title="Actualizar pedidos"
              className="admin-link-btn text-xs py-1 px-2 rounded-md"
            >
              <RefreshCw
                size={13}
                className={refreshing ? "animate-spin text-[var(--dash-accent)]" : ""}
              />
              <span>{refreshing ? "Actualizando..." : "Actualizar"}</span>
            </button>

            <Link
              href="/admin/pedidos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--dash-accent)] hover:underline"
            >
              <span>Ver todos</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {(
            [
              { key: "all", label: "Todos" },
              { key: "pending", label: "Pendientes", count: pendingOrders.length },
              { key: "confirmed", label: "Confirmados" },
              { key: "delivered", label: "Entregados" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`admin-toolbar-pill text-xs py-1 px-2.5 ${
                statusFilter === tab.key ? "admin-toolbar-pill--active" : ""
              }`}
            >
              <span>{tab.label}</span>
              {"count" in tab && tab.count && tab.count > 0 ? (
                <span className="ml-1 font-bold">({tab.count})</span>
              ) : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-[var(--dash-muted)]">
            Cargando pedidos recientes...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-8 px-4 text-center text-[var(--dash-muted)] flex flex-col items-center gap-2">
            <ShoppingBag size={32} className="opacity-30" />
            <p className="text-sm font-semibold text-[var(--dash-text)]">
              Todavía no se registraron pedidos
            </p>
            <span className="text-xs">
              Aparecerán aquí en tiempo real cuando un cliente haga un pedido.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order, idx) => {
              const hasPhone = Boolean(
                order.customerPhone && order.customerPhone.trim().length > 5
              );

              return (
                <div
                  key={order.id ?? idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] hover:border-[var(--dash-accent)] transition-colors"
                >
                  {/* Left: Customer info & Items preview */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-full bg-[var(--dash-surface-3)] text-[var(--dash-accent)] flex items-center justify-center font-bold text-xs shrink-0">
                      {order.customerName.charAt(0).toUpperCase()}
                    </span>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs sm:text-sm font-bold text-[var(--dash-text)] hover:underline text-left"
                        >
                          {order.customerName}
                        </button>

                        {hasPhone && (
                          <a
                            href={buildAdminCustomerWhatsAppUrl(
                              order.customerPhone!,
                              order.customerName,
                              order.total,
                              order.status === "confirmed"
                                ? "confirmed"
                                : order.status === "delivered"
                                ? "delivered"
                                : "general"
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Chatear por WhatsApp con ${order.customerName}`}
                            className="text-[#25d366] hover:opacity-80 transition-opacity"
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}
                      </div>

                      <div className="text-xs text-[var(--dash-muted)] truncate">
                        {order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                      </div>

                      {/* Delivery & Payment Badges */}
                      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                        {order.comment?.includes("[Envío a Domicilio") && (
                          <span className="admin-badge admin-badge--info text-xs">
                            <Truck size={12} />
                            <span>Domicilio</span>
                          </span>
                        )}
                        {order.comment?.includes("[Retiro en Local") && (
                          <span className="admin-badge admin-badge--accent text-xs">
                            <Store size={12} />
                            <span>Retiro Local</span>
                          </span>
                        )}
                        {order.comment?.includes("[Pago: Transferencia") && (
                          <span className="admin-badge admin-badge--success text-xs">
                            <ArrowRightLeft size={12} />
                            <span>Transferencia</span>
                          </span>
                        )}
                        {order.comment?.includes("[Cupón:") && (
                          <span className="admin-badge admin-badge--warning text-xs">
                            <Tag size={12} />
                            <span>Cupón</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Total, Time, and Status Select */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="font-serif font-bold text-sm text-[var(--dash-accent)]">
                        {formatPrice(order.total)}
                      </div>
                      <div className="text-xs text-[var(--dash-muted)]">
                        {formatRelativeTime(order.createdAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <OrderStatusSelect
                        status={order.status}
                        onChange={(status) => handleStatusChange(order.id!, status)}
                      />

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="admin-icon-btn"
                        title="Ver detalle del pedido"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>

      {/* Order Detail Modal / Drawer */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

export default RecentOrdersWidget;
