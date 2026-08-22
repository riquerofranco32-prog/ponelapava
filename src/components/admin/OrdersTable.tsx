"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  Search,
} from "lucide-react";
import { Order } from "@/types";
import { STATUS_LABELS } from "@/lib/orderStatus";
import { AdminKpiCard } from "./AdminCard";
import { AdminButton } from "./AdminButton";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { assertOk } from "@/lib/admin-fetch";
import { useAdminToast } from "./AdminToast";
import { OrderDesktopRow } from "./orders/OrderDesktopRow";
import { OrderMobileCard } from "./orders/OrderMobileCard";
import { OrderDetailModal } from "./orders/OrderDetailModal";

type StatusFilter = "all" | Order["status"];

// ponytail: naive CSV field escaping (wrap+double quotes) — covers Excel/Sheets fine
function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function exportOrdersToCsv(orders: Order[]) {
  const header = ["customerName", "items", "total", "createdAt", "status"];
  const rows = orders.map((o) => [
    csvField(o.customerName),
    csvField(o.items.map((i) => `${i.productName} x${i.quantity}`).join("; ")),
    csvField(String(o.total)),
    csvField(o.createdAt),
    csvField(o.status),
  ]);
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pedidos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const showToast = useAdminToast();

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
      showToast(`Pedido marcado como ${STATUS_LABELS[status].toLowerCase()}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo actualizar el estado",
        "error",
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
  const statusFiltered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);
  const searchTerm = search.trim().toLowerCase();
  const filteredOrders = !searchTerm
    ? statusFiltered
    : statusFiltered.filter(
        (o) =>
          o.customerName.toLowerCase().includes(searchTerm) ||
          o.items.some((i) => i.productName.toLowerCase().includes(searchTerm)),
      );

  const th: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--dash-muted)",
  };

  return (
    <div>
      <div className="admin-kpi-grid">
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
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                color:
                  statusFilter === f.value ? "#1e1b15" : "var(--dash-muted)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--dash-muted)",
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente o producto..."
              style={{
                borderRadius: 999,
                padding: "6px 14px 6px 30px",
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid var(--dash-border)",
                background: "var(--dash-surface-2)",
                color: "var(--dash-muted)",
                outline: "none",
                minWidth: 200,
              }}
            />
          </div>
          <AdminButton
            variant="secondary"
            onClick={() => exportOrdersToCsv(filteredOrders)}
          >
            Exportar CSV
          </AdminButton>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Sin pedidos en este estado"
          description="Probá con otro filtro."
        />
      ) : (
        <>
          <div
            className="admin-desktop-only"
            style={{ overflowX: "auto", maxHeight: "70vh" }}
          >
            <table
              className="admin-table"
              style={{
                width: "100%",
                fontSize: 14,
                borderCollapse: "collapse",
              }}
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
                {filteredOrders.map((order, index) => (
                  <OrderDesktopRow
                    key={order.id}
                    order={order}
                    index={index}
                    onStatusChange={handleStatusChange}
                    onView={setViewingOrder}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="admin-mobile-only"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {filteredOrders.map((order, index) => (
              <OrderMobileCard
                key={order.id}
                order={order}
                index={index}
                onStatusChange={handleStatusChange}
                onView={setViewingOrder}
              />
            ))}
          </div>
        </>
      )}

      {viewingOrder && (
        <OrderDetailModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
        />
      )}
    </div>
  );
}
