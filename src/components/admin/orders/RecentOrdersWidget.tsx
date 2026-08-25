"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  RefreshCw,
  Eye,
  MessageCircle,
  AlertCircle,
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
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err) {
      if (!silent) {
        showToast(
          err instanceof Error ? err.message : "Error al actualizar pedidos",
          "error",
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
    }, 20_000); // live sync every 20s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStatusChange(id: string, status: Order["status"]) {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
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
        "error",
      );
      fetchRecentOrders(true);
    }
  }

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const recentOrders = orders.slice(0, 6);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Pending Orders Action Banner */}
      {pendingOrders.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            borderRadius: "var(--radius-control, 10px)",
            backgroundColor: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            color: "var(--dash-text)",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle
              size={18}
              style={{ color: "#f59e0b", flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Tenés{" "}
              <strong style={{ color: "#f59e0b" }}>
                {pendingOrders.length} pedido{pendingOrders.length !== 1 ? "s" : ""}{" "}
                pendiente{pendingOrders.length !== 1 ? "s" : ""}
              </strong>{" "}
              por confirmar o despachar.
            </span>
          </div>
          <Link
            href="/admin/pedidos"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#f59e0b",
              textDecoration: "underline",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Gestionar pedidos <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Recent Orders Card */}
      <AdminCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 className="admin-section-title" style={{ margin: 0 }}>
              Pedidos Recientes
            </h2>
            {orders.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: "var(--dash-surface-2)",
                  color: "var(--dash-muted)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid var(--dash-border)",
                }}
              >
                {orders.length} totales
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => fetchRecentOrders()}
              disabled={refreshing}
              title="Actualizar pedidos"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "var(--dash-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 6,
              }}
              className="admin-link-btn"
            >
              <RefreshCw
                size={13}
                style={{
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                }}
              />
              <span>{refreshing ? "Actualizando..." : "Actualizar"}</span>
            </button>

            <Link
              href="/admin/pedidos"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--dash-accent)",
                textDecoration: "none",
              }}
            >
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: "var(--dash-muted)", fontSize: 13 }}>
            Cargando pedidos recientes...
          </div>
        ) : recentOrders.length === 0 ? (
          <div
            style={{
              padding: "28px 16px",
              textAlign: "center",
              color: "var(--dash-muted)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShoppingBag size={32} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
              Todavía no se registraron pedidos
            </p>
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              Aparecerán aquí en tiempo real cuando un cliente haga un pedido desde el carrito.
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentOrders.map((order, idx) => {
              const hasPhone = Boolean(order.customerPhone && order.customerPhone.trim().length > 5);

              return (
                <div
                  key={order.id ?? idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    backgroundColor: "var(--dash-surface-2)",
                    border: "1px solid var(--dash-border)",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  {/* Left: Customer info & Items preview */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        backgroundColor: "var(--dash-surface-3)",
                        color: "var(--dash-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {order.customerName.charAt(0).toUpperCase()}
                    </span>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--dash-text)",
                            textAlign: "left",
                          }}
                          className="hover:underline"
                        >
                          {order.customerName}
                        </button>

                        {hasPhone && (
                          <a
                            href={buildAdminCustomerWhatsAppUrl(
                              order.customerPhone!,
                              order.customerName,
                              order.total,
                              order.status === "confirmed" ? "confirmed" : order.status === "delivered" ? "delivered" : "general"
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Chatear por WhatsApp con ${order.customerName}`}
                            style={{
                              color: "var(--color-whatsapp, #25d366)",
                              display: "inline-flex",
                              alignItems: "center",
                              opacity: 0.85,
                            }}
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--dash-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: 1,
                        }}
                      >
                        {order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right: Total & Relative Time */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--dash-accent)",
                      }}
                    >
                      {formatPrice(order.total)}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--dash-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        marginTop: 1,
                      }}
                    >
                      <Clock size={10} />
                      {formatRelativeTime(order.createdAt)}
                    </span>
                  </div>

                  {/* Status Dropdown & Action */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <OrderStatusSelect
                      status={order.status}
                      onChange={(next) => handleStatusChange(order.id!, next)}
                    />
                    <button
                      onClick={() => setSelectedOrder(order)}
                      title="Ver detalle del pedido"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--dash-muted)",
                        cursor: "pointer",
                        padding: 6,
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
