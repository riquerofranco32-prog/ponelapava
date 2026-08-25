"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Clock,
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { Order } from "@/types";
import { STATUS_LABELS } from "@/lib/orderStatus";
import { formatPrice } from "@/lib/utils";
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
type SortColumn = "date" | "total";
type SortDir = "asc" | "desc";

// naive CSV field escaping (wrap+double quotes) — covers Excel/Sheets fine
function csvField(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

function exportOrdersToCsv(orders: Order[]) {
  const header = [
    "ID Pedido",
    "Fecha",
    "Cliente",
    "Telefono",
    "Productos",
    "Cantidad Total Items",
    "Subtotal",
    "Total",
    "Estado",
    "Observacion",
  ];
  const rows = orders.map((o) => {
    const totalItems = o.items.reduce((sum, i) => sum + i.quantity, 0);
    const itemsDetail = o.items
      .map((i) => `${i.productName} (x${i.quantity} @ ${formatPrice(i.price)})`)
      .join("; ");

    return [
      csvField(o.id || ""),
      csvField(new Date(o.createdAt).toLocaleString("es-AR")),
      csvField(o.customerName),
      csvField(o.customerPhone || ""),
      csvField(itemsDetail),
      csvField(totalItems),
      csvField(o.subtotal || o.total),
      csvField(o.total),
      csvField(STATUS_LABELS[o.status] || o.status),
      csvField(o.comment || ""),
    ];
  });

  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pedidos-ponelapava-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const showToast = useAdminToast();

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDir("desc");
    }
  }

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      assertOk(res, "No se pudieron cargar los pedidos");
      setOrders(await res.json());
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => loadOrders(true), 20_000);
    return () => clearInterval(interval);
  }, [loadOrders]);

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

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkStatusChange(status: Order["status"]) {
    const ids = Array.from(selectedIds);
    setBulkUpdating(true);
    setOrders((prev) =>
      prev.map((o) => (ids.includes(o.id!) ? { ...o, status } : o)),
    );
    try {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/orders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }),
        ),
      );
      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        throw new Error(
          `${failed} de ${ids.length} pedidos no se pudieron actualizar`,
        );
      }
      showToast(
        `${ids.length} pedido${ids.length !== 1 ? "s" : ""} marcado${ids.length !== 1 ? "s" : ""} como ${STATUS_LABELS[status].toLowerCase()}`,
      );
      setSelectedIds(new Set());
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo actualizar en lote",
        "error",
      );
      loadOrders(); // revert the optimistic update
    } finally {
      setBulkUpdating(false);
    }
  }

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  if (error) {
    return <div className="admin-error-banner">{error}</div>;
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
  const searchFiltered = !searchTerm
    ? statusFiltered
    : statusFiltered.filter(
        (o) =>
          o.customerName.toLowerCase().includes(searchTerm) ||
          o.items.some((i) => i.productName.toLowerCase().includes(searchTerm)),
      );
  const fromMs = dateFrom ? new Date(dateFrom).getTime() : null;
  // end of day so "hasta" incluye todo el día seleccionado
  const toMs = dateTo
    ? new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1
    : null;
  const dateFiltered = searchFiltered.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    if (fromMs !== null && t < fromMs) return false;
    if (toMs !== null && t > toMs) return false;
    return true;
  });
  const filteredOrders = [...dateFiltered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortColumn === "total") return (a.total - b.total) * dir;
    return (
      (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
    );
  });
  const allVisibleSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedIds.has(o.id!));

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filteredOrders.forEach((o) => next.delete(o.id!));
        return next;
      }
      const next = new Set(prev);
      filteredOrders.forEach((o) => next.add(o.id!));
      return next;
    });
  }

  const th: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--dash-muted)",
  };

  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  const counts: Record<StatusFilter, number> = {
    all: orders.length,
    pending: pendingCount,
    confirmed: confirmedCount,
    delivered: deliveredCount,
    cancelled: cancelledCount,
  };

  return (
    <div>
      <div className="admin-kpi-grid">
        <AdminKpiCard
          icon={ShoppingBag}
          label="Total"
          value={orders.length}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        <AdminKpiCard
          icon={Clock}
          label="Pendientes"
          value={pendingCount}
          active={statusFilter === "pending"}
          onClick={() => setStatusFilter("pending")}
        />
        <AdminKpiCard
          icon={CheckCircle2}
          label="Confirmados"
          value={confirmedCount}
          active={statusFilter === "confirmed"}
          onClick={() => setStatusFilter("confirmed")}
        />
        <AdminKpiCard
          icon={PackageCheck}
          label="Entregados"
          value={deliveredCount}
          active={statusFilter === "delivered"}
          onClick={() => setStatusFilter("delivered")}
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
              className={`admin-toolbar-pill${
                statusFilter === f.value ? " admin-toolbar-pill--active" : ""
              }`}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span>{f.label}</span>
              <span
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                  fontWeight: statusFilter === f.value ? 700 : 500,
                }}
              >
                ({counts[f.value]})
              </span>
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
              className="admin-toolbar-input"
              style={{ padding: "6px 14px 6px 30px", minWidth: 200 }}
            />
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {/* Quick date presets */}
            <div style={{ display: "flex", gap: 4, marginRight: 4 }}>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setDateFrom(today);
                  setDateTo(today);
                }}
                className="admin-toolbar-pill"
                style={{ fontSize: 11, padding: "4px 8px" }}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => {
                  const to = new Date();
                  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setDateFrom(from.toISOString().slice(0, 10));
                  setDateTo(to.toISOString().slice(0, 10));
                }}
                className="admin-toolbar-pill"
                style={{ fontSize: 11, padding: "4px 8px" }}
              >
                7 días
              </button>
              <button
                type="button"
                onClick={() => {
                  const to = new Date();
                  const from = new Date(to.getFullYear(), to.getMonth(), 1);
                  setDateFrom(from.toISOString().slice(0, 10));
                  setDateTo(to.toISOString().slice(0, 10));
                }}
                className="admin-toolbar-pill"
                style={{ fontSize: 11, padding: "4px 8px" }}
              >
                Este mes
              </button>
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="Desde"
              className="admin-toolbar-input"
              style={{ padding: "6px 10px" }}
            />
            <span style={{ color: "var(--dash-muted)", fontSize: 12 }}>–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="Hasta"
              className="admin-toolbar-input"
              style={{ padding: "6px 10px" }}
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                aria-label="Limpiar rango de fechas"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--dash-muted)",
                  cursor: "pointer",
                  fontSize: 13,
                  padding: "0 4px",
                }}
              >
                ✕
              </button>
            )}
          </div>
          <AdminButton
            variant="secondary"
            onClick={() => loadOrders(false)}
            disabled={refreshing || loading}
          >
            <RefreshCw
              size={13}
              style={{
                marginRight: 6,
                display: "inline",
                animation: refreshing ? "spin 1s linear infinite" : "none",
              }}
            />
            {refreshing ? "Actualizando..." : "Refrescar"}
          </AdminButton>
          <AdminButton
            variant="secondary"
            onClick={() => exportOrdersToCsv(filteredOrders)}
          >
            Exportar CSV
          </AdminButton>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            padding: "10px 14px",
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid var(--dash-accent)",
            background: "var(--dash-surface-2)",
          }}
        >
          <span
            style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)" }}
          >
            {selectedIds.size} pedido{selectedIds.size !== 1 ? "s" : ""}{" "}
            seleccionado
            {selectedIds.size !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 12, color: "var(--dash-muted)" }}>
            Marcar como:
          </span>
          {(
            [
              "pending",
              "confirmed",
              "delivered",
              "cancelled",
            ] as Order["status"][]
          ).map((status) => (
            <AdminButton
              key={status}
              variant="secondary"
              disabled={bulkUpdating}
              onClick={() => handleBulkStatusChange(status)}
            >
              {STATUS_LABELS[status]}
            </AdminButton>
          ))}
          <button
            onClick={() => setSelectedIds(new Set())}
            disabled={bulkUpdating}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              fontSize: 12,
              color: "var(--dash-muted)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Cancelar selección
          </button>
        </div>
      )}

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
                  <th style={{ ...th, width: 32 }}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      aria-label="Seleccionar todos los pedidos visibles"
                    />
                  </th>
                  <th style={th}>Cliente</th>
                  <th style={th}>Productos</th>
                  <th style={th}>
                    <button
                      onClick={() => handleSort("total")}
                      style={{
                        ...th,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Total
                      {sortColumn === "total" ? (
                        sortDir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
                      )}
                    </button>
                  </th>
                  <th style={th}>
                    <button
                      onClick={() => handleSort("date")}
                      style={{
                        ...th,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Fecha
                      {sortColumn === "date" ? (
                        sortDir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
                      )}
                    </button>
                  </th>
                  <th style={th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <OrderDesktopRow
                    key={order.id}
                    order={order}
                    index={index}
                    selected={selectedIds.has(order.id!)}
                    onToggleSelect={toggleSelect}
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
                selected={selectedIds.has(order.id!)}
                onToggleSelect={toggleSelect}
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
