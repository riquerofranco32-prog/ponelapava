"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
  AlertCircle,
  Kanban,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  Truck,
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
import { OrdersKanbanView } from "./orders/OrdersKanbanView";

type StatusFilter = "all" | Order["status"];
type PaymentFilter = "all" | "unpaid" | "paid";
type SortColumn = "date" | "total";
type SortDir = "asc" | "desc";

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
    "Cobro",
    "Fecha Cobro",
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
      csvField(o.paymentStatus === "paid" ? "Cobrado" : "Sin cobrar"),
      csvField(o.paidAt ? new Date(o.paidAt).toLocaleString("es-AR") : ""),
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
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [totalUnpaidAmount, setTotalUnpaidAmount] = useState(0);

  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const [sortColumn, setSortColumn] = useState<SortColumn>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const showToast = useAdminToast();

  useEffect(() => {
    const p = searchParams.get("paymentStatus");
    if (p === "unpaid" || p === "paid") {
      setPaymentFilter(p);
    }
  }, [searchParams]);

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
      const params = new URLSearchParams();
      if (viewMode === "kanban") {
        params.set("limit", "100");
        params.set("page", "1");
        if (statusFilter !== "all") params.set("status", statusFilter);
      } else {
        params.set("page", String(page));
        params.set("limit", "50");
        if (statusFilter !== "all") params.set("status", statusFilter);
      }

      if (paymentFilter !== "all") params.set("paymentStatus", paymentFilter);
      if (search.trim()) params.set("search", search.trim());
      if (dateFrom) params.set("startDate", dateFrom);
      if (dateTo) params.set("endDate", dateTo);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      assertOk(res, "No se pudieron cargar los pedidos");
      const json = await res.json();
      if (Array.isArray(json)) {
        setOrders(json);
        setTotalCount(json.length);
        setTotalPages(1);
      } else {
        setOrders(json.orders || []);
        setTotalCount(json.total || 0);
        setTotalPages(json.totalPages || 1);
        setUnpaidCount(json.unpaidCount || 0);
        setTotalUnpaidAmount(json.totalUnpaidAmount || 0);
      }
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, paymentFilter, search, dateFrom, dateTo, viewMode]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => loadOrders(true), 25_000);
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
      loadOrders(true);
    }
  }

  async function handlePaymentStatusChange(
    id: string,
    paymentStatus: "unpaid" | "paid",
  ) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              paymentStatus,
              paidAt: paymentStatus === "paid" ? new Date().toISOString() : null,
            }
          : o,
      ),
    );
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      assertOk(res, "No se pudo actualizar el estado de cobro");
      showToast(
        paymentStatus === "paid"
          ? "Pedido marcado como cobrado"
          : "Pedido marcado como sin cobrar",
      );
      loadOrders(true);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al actualizar cobro",
        "error",
      );
      loadOrders(true);
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
      loadOrders(true);
    } finally {
      setBulkUpdating(false);
    }
  }

  const sortedOrders = [...orders].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortColumn === "total") return (a.total - b.total) * dir;
    return (
      (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
    );
  });

  const allVisibleSelected =
    sortedOrders.length > 0 &&
    sortedOrders.every((o) => selectedIds.has(o.id!));

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        sortedOrders.forEach((o) => next.delete(o.id!));
        return next;
      }
      const next = new Set(prev);
      sortedOrders.forEach((o) => next.add(o.id!));
      return next;
    });
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "confirmed" || o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  const th: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 14px",
    color: "var(--dash-muted)",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div>
      {/* KPI Cards */}
      <div className="admin-kpi-grid" style={{ marginBottom: 20 }}>
        <AdminKpiCard
          icon={Clock}
          label="Pendientes"
          value={pendingCount}
          active={statusFilter === "pending"}
          onClick={() => {
            setStatusFilter((prev) => (prev === "pending" ? "all" : "pending"));
            setPage(1);
          }}
        />
        <AdminKpiCard
          icon={CheckCircle2}
          label="En preparación"
          value={preparingCount}
          active={statusFilter === "preparing" || statusFilter === "confirmed"}
          onClick={() => {
            setStatusFilter((prev) => (prev === "preparing" ? "all" : "preparing"));
            setPage(1);
          }}
        />
        <AdminKpiCard
          icon={Truck}
          label="Listos"
          value={readyCount}
          active={statusFilter === "ready"}
          onClick={() => {
            setStatusFilter((prev) => (prev === "ready" ? "all" : "ready"));
            setPage(1);
          }}
        />
        <AdminKpiCard
          icon={PackageCheck}
          label="Entregados"
          value={deliveredCount}
          active={statusFilter === "delivered"}
          onClick={() => {
            setStatusFilter((prev) => (prev === "delivered" ? "all" : "delivered"));
            setPage(1);
          }}
        />
        <AdminKpiCard
          icon={AlertCircle}
          label="Total Adeudado"
          value={formatPrice(totalUnpaidAmount)}
          active={paymentFilter === "unpaid"}
          change={unpaidCount > 0 ? `${unpaidCount} sin cobrar` : undefined}
          trend={unpaidCount > 0 ? "down" : undefined}
          onClick={() => {
            setPaymentFilter((prev) => (prev === "unpaid" ? "all" : "unpaid"));
            setPage(1);
          }}
        />
      </div>

      {/* Main Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexDirection: "column",
          marginBottom: 16,
        }}
      >
        {/* Status and View Mode Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {/* Status Pills */}
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 4,
              WebkitOverflowScrolling: "touch",
              maxWidth: "100%",
            }}
          >
            {(
              [
                { value: "all", label: "Todos" },
                { value: "pending", label: "Pendientes" },
                { value: "confirmed", label: "Confirmados" },
                { value: "preparing", label: "En prep." },
                { value: "ready", label: "Listos" },
                { value: "delivered", label: "Entregados" },
                { value: "cancelled", label: "Cancelados" },
              ] as { value: StatusFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
                className={`admin-toolbar-pill${
                  statusFilter === f.value ? " admin-toolbar-pill--active" : ""
                }`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Table vs Kanban */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "var(--dash-surface-2)",
              border: "1px solid var(--dash-border)",
              borderRadius: 8,
              padding: 2,
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 6,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "table" ? "var(--dash-surface)" : "none",
                color: viewMode === "table" ? "var(--dash-text)" : "var(--dash-muted)",
                boxShadow: viewMode === "table" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <LayoutList size={14} />
              <span>Tabla</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 6,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "kanban" ? "var(--dash-surface)" : "none",
                color: viewMode === "kanban" ? "var(--dash-text)" : "var(--dash-muted)",
                boxShadow: viewMode === "kanban" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <Kanban size={14} />
              <span>Kanban</span>
            </button>
          </div>
        </div>

        {/* Filters bar: Search, Payment Status, Date Pickers, CSV, Refresh */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 200px" }}>
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar cliente o teléfono..."
              className="admin-toolbar-input"
              style={{ padding: "6px 14px 6px 30px", width: "100%" }}
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as PaymentFilter);
              setPage(1);
            }}
            className="admin-toolbar-input"
            aria-label="Filtro de cobro"
            style={{ padding: "5px 10px", fontSize: 12, fontWeight: 500 }}
          >
            <option value="all">Cobro: Todos</option>
            <option value="unpaid">Sin cobrar</option>
            <option value="paid">Cobrado</option>
          </select>

          {/* Date presets */}
          <div style={{ display: "flex", gap: 4 }}>
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                setDateFrom(today);
                setDateTo(today);
                setPage(1);
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
                setPage(1);
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
                setPage(1);
              }}
              className="admin-toolbar-pill"
              style={{ fontSize: 11, padding: "4px 8px" }}
            >
              Este mes
            </button>
          </div>

          {/* Date Inputs */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              aria-label="Desde"
              className="admin-toolbar-input"
              style={{ padding: "4px 8px", fontSize: 12 }}
            />
            <span style={{ color: "var(--dash-muted)", fontSize: 12 }}>–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              aria-label="Hasta"
              className="admin-toolbar-input"
              style={{ padding: "4px 8px", fontSize: 12 }}
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setPage(1);
                }}
                aria-label="Limpiar fechas"
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

          {/* Action buttons */}
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
            {refreshing ? "..." : "Refrescar"}
          </AdminButton>

          <AdminButton
            variant="secondary"
            onClick={() => exportOrdersToCsv(sortedOrders)}
          >
            CSV
          </AdminButton>
        </div>
      </div>

      {/* Bulk status bar */}
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
            {selectedIds.size} pedido{selectedIds.size !== 1 ? "s" : ""} seleccionado
            {selectedIds.size !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 12, color: "var(--dash-muted)" }}>
            Marcar como:
          </span>
          {(
            [
              "pending",
              "confirmed",
              "preparing",
              "ready",
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

      {/* Content Area: Table vs Kanban */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : error ? (
        <div className="admin-error-banner">{error}</div>
      ) : sortedOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Sin pedidos encontrados"
          description="Probá ajustando los filtros de búsqueda o fecha."
        />
      ) : viewMode === "kanban" ? (
        <OrdersKanbanView
          orders={sortedOrders}
          onStatusChange={handleStatusChange}
          onPaymentStatusChange={handlePaymentStatusChange}
          onViewOrder={setViewingOrder}
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
                  <th style={th}>Cobro</th>
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
                {sortedOrders.map((order, index) => (
                  <OrderDesktopRow
                    key={order.id}
                    order={order}
                    index={index}
                    selected={selectedIds.has(order.id!)}
                    onToggleSelect={toggleSelect}
                    onStatusChange={handleStatusChange}
                    onPaymentStatusChange={handlePaymentStatusChange}
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
            {sortedOrders.map((order, index) => (
              <OrderMobileCard
                key={order.id}
                order={order}
                index={index}
                selected={selectedIds.has(order.id!)}
                onToggleSelect={toggleSelect}
                onStatusChange={handleStatusChange}
                onPaymentStatusChange={handlePaymentStatusChange}
                onView={setViewingOrder}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {viewMode === "table" && totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 4px",
                borderTop: "1px solid var(--dash-border)",
                marginTop: 14,
                fontSize: 13,
                color: "var(--dash-muted)",
              }}
            >
              <span>
                Página <strong>{page}</strong> de <strong>{totalPages}</strong> ({totalCount} pedidos)
              </span>

              <div style={{ display: "flex", gap: 8 }}>
                <AdminButton
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} style={{ marginRight: 4 }} />
                  Anterior
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                  <ChevronRight size={14} style={{ marginLeft: 4 }} />
                </AdminButton>
              </div>
            </div>
          )}
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
