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

  return (
    <div>
      {/* KPI Cards */}
      <div className="admin-kpi-grid mb-5">
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
      <div className="flex flex-col gap-3 mb-4">
        {/* Status and View Mode Controls */}
        <div className="flex justify-between items-center flex-wrap gap-2.5">
          {/* Status Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
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
                className={`admin-toolbar-pill inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  statusFilter === f.value ? " admin-toolbar-pill--active" : ""
                }`}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Table vs Kanban */}
          <div className="inline-flex items-center bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border-none transition-all ${
                viewMode === "table"
                  ? "bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm"
                  : "bg-transparent text-[var(--dash-muted)]"
              }`}
            >
              <LayoutList size={14} />
              <span>Tabla</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border-none transition-all ${
                viewMode === "kanban"
                  ? "bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm"
                  : "bg-transparent text-[var(--dash-muted)]"
              }`}
            >
              <Kanban size={14} />
              <span>Kanban</span>
            </button>
          </div>
        </div>

        {/* Filters bar: Search, Payment Status, Date Pickers, CSV, Refresh */}
        <div className="flex gap-2 items-center flex-wrap w-full">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--dash-muted)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar cliente o teléfono..."
              className="admin-toolbar-input pl-8 pr-3.5 py-1.5 w-full text-xs"
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as PaymentFilter);
              setPage(1);
            }}
            className="admin-toolbar-input px-2.5 py-1.5 text-xs font-medium"
            aria-label="Filtro de cobro"
          >
            <option value="all">Cobro: Todos</option>
            <option value="unpaid">Sin cobrar</option>
            <option value="paid">Cobrado</option>
          </select>

          {/* Date presets */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                setDateFrom(today);
                setDateTo(today);
                setPage(1);
              }}
              className="admin-toolbar-pill text-xs px-2 py-1"
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
              className="admin-toolbar-pill text-xs px-2 py-1"
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
              className="admin-toolbar-pill text-xs px-2 py-1"
            >
              Este mes
            </button>
          </div>

          {/* Date Inputs */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              aria-label="Desde"
              className="admin-toolbar-input px-2 py-1 text-xs"
            />
            <span className="text-[var(--dash-muted)] text-xs">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              aria-label="Hasta"
              className="admin-toolbar-input px-2 py-1 text-xs"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setPage(1);
                }}
                aria-label="Limpiar fechas"
                className="bg-transparent border-none text-[var(--dash-muted)] cursor-pointer text-xs px-1 hover:text-[var(--dash-text)]"
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
              className={`mr-1.5 inline ${refreshing ? "animate-spin" : ""}`}
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
        <div className="flex gap-2.5 flex-wrap items-center px-3.5 py-2.5 mb-3 rounded-xl border border-[var(--dash-accent)] bg-[var(--dash-surface-2)]">
          <span className="text-xs font-semibold text-[var(--dash-text)]">
            {selectedIds.size} pedido{selectedIds.size !== 1 ? "s" : ""} seleccionado
            {selectedIds.size !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-[var(--dash-muted)]">
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
            className="ml-auto bg-transparent border-none text-xs text-[var(--dash-muted)] cursor-pointer underline hover:text-[var(--dash-text)]"
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
          <div className="admin-desktop-only overflow-x-auto max-h-[70vh]">
            <table className="admin-table w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="w-8 text-left px-3.5 py-2.5 text-[var(--dash-muted)] text-xs font-semibold uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      aria-label="Seleccionar todos los pedidos visibles"
                    />
                  </th>
                  <th className="text-left px-3.5 py-2.5 text-[var(--dash-muted)] text-xs font-semibold uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-3.5 py-2.5 text-[var(--dash-muted)] text-xs font-semibold uppercase tracking-wider">Productos</th>
                  <th className="text-left px-3.5 py-2.5 text-[var(--dash-muted)] text-xs font-semibold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("total")}
                      className="p-0 flex items-center gap-1 bg-transparent border-none cursor-pointer uppercase text-xs font-semibold tracking-wider text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                    >
                      Total
                      {sortColumn === "total" ? (
                        sortDir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-3.5 py-2.5 text-[var(--dash-muted)] text-xs font-semibold uppercase tracking-wider">Cobro</th>
                  <th className="text-left px-3.5 py-2.5 text-[var(--dash-muted)] text-xs font-semibold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("date")}
                      className="p-0 flex items-center gap-1 bg-transparent border-none cursor-pointer uppercase text-xs font-semibold tracking-wider text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                    >
                      Fecha
                      {sortColumn === "date" ? (
                        sortDir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-3.5 py-2.5 text-[var(--dash-muted)] text-xs font-semibold uppercase tracking-wider">Estado</th>
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

          <div className="admin-mobile-only flex flex-col gap-2.5">
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
            <div className="flex items-center justify-between py-4 px-1 border-t border-[var(--dash-border)] mt-3.5 text-xs text-[var(--dash-muted)]">
              <span>
                Página <strong>{page}</strong> de <strong>{totalPages}</strong> ({totalCount} pedidos)
              </span>

              <div className="flex gap-2">
                <AdminButton
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} className="mr-1" />
                  Anterior
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                  <ChevronRight size={14} className="ml-1" />
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
