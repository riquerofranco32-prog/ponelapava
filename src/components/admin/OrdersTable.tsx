"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle2, PackageCheck, ShoppingBag } from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AdminKpiCard } from "./AdminCard";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { assertOk } from "@/lib/admin-fetch";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<Order["status"], { color: string; bg: string }> = {
  pending: { color: "var(--dash-accent)", bg: "rgba(199,166,122,0.12)" },
  confirmed: { color: "var(--dash-success)", bg: "var(--dash-success-bg)" },
  delivered: { color: "var(--dash-muted)", bg: "var(--dash-surface-2)" },
  cancelled: { color: "var(--dash-danger)", bg: "var(--dash-danger-bg)" },
};

type StatusFilter = "all" | Order["status"];

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      assertOk(res, "No se pudieron cargar los pedidos");
      setOrders(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(id: string, status: Order["status"]) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      assertOk(res, "No se pudo actualizar el estado del pedido");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el estado",
      );
      loadOrders(); // revert the optimistic update
    }
  }

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  if (error) {
    return (
      <div
        style={{
          background: "var(--dash-danger-bg)",
          border: "1px solid var(--dash-danger-border)",
          borderRadius: 8,
          padding: "12px 16px",
          fontSize: 14,
          color: "var(--dash-danger)",
        }}
      >
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Todavía no hay pedidos"
        description="Se registran automáticamente cuando un cliente completa el checkout en /carrito."
      />
    );
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const th: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--dash-muted)",
  };
  const td: React.CSSProperties = {
    padding: "12px 14px",
    borderTop: "1px solid var(--dash-border)",
    verticalAlign: "top",
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <AdminKpiCard icon={ShoppingBag} label="Total" value={orders.length} />
        <AdminKpiCard icon={Clock} label="Pendientes" value={pendingCount} />
        <AdminKpiCard
          icon={CheckCircle2}
          label="Confirmados"
          value={confirmedCount}
        />
        <AdminKpiCard
          icon={PackageCheck}
          label="Entregados"
          value={deliveredCount}
        />
      </div>

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        {(
          [
            { value: "all", label: "Todos" },
            { value: "pending", label: STATUS_LABELS.pending },
            { value: "confirmed", label: STATUS_LABELS.confirmed },
            { value: "delivered", label: STATUS_LABELS.delivered },
            { value: "cancelled", label: STATUS_LABELS.cancelled },
          ] as { value: StatusFilter; label: string }[]
        ).map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            style={{
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border:
                statusFilter === f.value
                  ? "1px solid var(--dash-accent)"
                  : "1px solid var(--dash-border)",
              background:
                statusFilter === f.value
                  ? "var(--dash-accent)"
                  : "var(--dash-surface-2)",
              color: statusFilter === f.value ? "#1e1b15" : "var(--dash-muted)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Sin pedidos en este estado"
          description="Probá con otro filtro."
        />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th style={th}>Cliente</th>
                <th style={th}>Productos</th>
                <th style={th}>Total</th>
                <th style={th}>Fecha</th>
                <th style={th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={td}>
                    <span
                      style={{ fontWeight: 500, color: "var(--dash-text)" }}
                    >
                      {order.customerName}
                    </span>
                    {order.comment && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 12,
                          color: "var(--dash-muted)",
                          marginTop: 2,
                          maxWidth: 220,
                        }}
                      >
                        {order.comment}
                      </span>
                    )}
                  </td>
                  <td
                    style={{ ...td, color: "var(--dash-muted)", maxWidth: 280 }}
                  >
                    {order.items
                      .map((i) => `${i.productName} x${i.quantity}`)
                      .join(", ")}
                  </td>
                  <td
                    style={{
                      ...td,
                      fontWeight: 500,
                      color: "var(--dash-text)",
                    }}
                  >
                    {formatPrice(order.total)}
                  </td>
                  <td
                    style={{
                      ...td,
                      color: "var(--dash-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(order.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={td}>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id!,
                          e.target.value as Order["status"],
                        )
                      }
                      style={{
                        ...STATUS_COLORS[order.status],
                        border: "none",
                        borderRadius: 999,
                        padding: "3px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {(Object.keys(STATUS_LABELS) as Order["status"][]).map(
                        (s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ),
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
