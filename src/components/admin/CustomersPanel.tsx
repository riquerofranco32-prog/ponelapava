"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  MessageCircle,
  Eye,
  Download,
  TrendingUp,
  Crown,
  Calendar,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Clock,
  Phone,
  Trash2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AdminKpiCard } from "./AdminCard";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./ui/EmptyState";
import { assertOk } from "@/lib/admin-fetch";
import { useAdminToast } from "./AdminToast";
import { CustomerWithStats, CustomersKpis, CustomerSegment } from "@/lib/customers";
import { CustomerDetailModal } from "./CustomerDetailModal";
import { StatusPill } from "./ui/Badge";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ConfirmDialog";

function exportCustomersCsv(customers: CustomerWithStats[]) {
  const header = [
    "Nombre",
    "Telefono Normalizado",
    "Telefono Visible",
    "Segmento",
    "Pedidos",
    "Total Gastado",
    "Ticket Promedio",
    "Ultimo Pedido",
    "Dias Sin Comprar",
    "Proximo Seguimiento",
    "Etiquetas",
    "Notas",
  ];
  const rows = customers.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.phoneNormalized.replace(/"/g, '""')}"`,
    `"${(c.displayPhone || "").replace(/"/g, '""')}"`,
    `"${c.segment}"`,
    c.ordersCount,
    c.totalSpent,
    c.averageTicket,
    `"${c.lastOrderDate || ""}"`,
    c.daysSinceLastOrder ?? "",
    `"${c.followUpAt || ""}"`,
    `"${c.tags.join("; ").replace(/"/g, '""')}"`,
    `"${(c.notes || "").replace(/"/g, '""')}"`,
  ]);
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `crm-clientes-ponelapava-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CustomersPanel() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [kpis, setKpis] = useState<CustomersKpis>({
    totalCustomers: 0,
    vipCount: 0,
    recurringCount: 0,
    riskCount: 0,
    newCount: 0,
    todayPendingCount: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<CustomerSegment>("all");
  const [riskDays, setRiskDays] = useState(45);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerWithStats | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const showToast = useAdminToast();

  const handleDeleteCustomer = async (customer: CustomerWithStats) => {
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "DELETE",
      });
      assertOk(res, "No se pudo eliminar el cliente");
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      if (selectedCustomer?.id === customer.id) setSelectedCustomer(null);
      setCustomerToDelete(null);
      showToast("Cliente eliminado permanentemente");
      loadCustomers();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al eliminar cliente",
        "error"
      );
    }
  };

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (search.trim()) q.set("search", search.trim());
      if (segment !== "all") q.set("segment", segment);
      q.set("riskDays", String(riskDays));

      const res = await fetch(`/api/admin/customers?${q.toString()}`);
      assertOk(res, "No se pudo cargar la base de clientes");
      const data = await res.json();
      setCustomers(data.customers || []);
      if (data.kpis) setKpis(data.kpis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [search, segment, riskDays]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  async function handleBackfill() {
    if (
      !confirm(
        "¿Deseás sincronizar todos los pedidos históricos hacia la tabla de clientes?\n\nEsto asociará pedidos huérfanos a cada cliente por teléfono normalizado (+54 9) y recalculará estadísticas."
      )
    ) {
      return;
    }

    setBackfilling(true);
    try {
      const res = await fetch("/api/admin/customers/backfill", { method: "POST" });
      assertOk(res, "Falló la sincronización de clientes");
      const data = await res.json();
      showToast(
        `¡Sincronización completa! ${data.linkedOrders} pedidos vinculados a ${data.customersCount} clientes.`
      );
      loadCustomers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al sincronizar", "error");
    } finally {
      setBackfilling(false);
    }
  }

  return (
    <div className="space-y-6 mb-12">
      {/* CRM KPI Cards */}
      <div className="admin-kpi-grid">
        <AdminKpiCard
          label="Base Total de Clientes"
          value={kpis.totalCustomers}
          icon={Users}
        />
        <AdminKpiCard
          label="Por Contactar Hoy"
          value={kpis.todayPendingCount}
          icon={Calendar}
          active={segment === "today"}
          onClick={() => setSegment("today")}
        />
        <AdminKpiCard
          label="Clientes VIP / Clave"
          value={kpis.vipCount}
          icon={Crown}
          active={segment === "vip"}
          onClick={() => setSegment("vip")}
        />
        <AdminKpiCard
          label="Facturación Total Clientes"
          value={formatPrice(kpis.totalRevenue)}
          icon={TrendingUp}
        />
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Segment Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setSegment("today")}
            className={`admin-toolbar-pill flex items-center gap-1.5 ${
              segment === "today" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            <Calendar size={13} />
            <span>Hoy</span>
            {kpis.todayPendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-[var(--dash-surface-3)] text-[var(--dash-accent)]">
                {kpis.todayPendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSegment("all")}
            className={`admin-toolbar-pill ${
              segment === "all" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            Todos ({kpis.totalCustomers})
          </button>

          <button
            type="button"
            onClick={() => setSegment("vip")}
            className={`admin-toolbar-pill flex items-center gap-1.5 ${
              segment === "vip" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            <Crown size={13} />
            <span>VIPs ({kpis.vipCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSegment("recurring")}
            className={`admin-toolbar-pill flex items-center gap-1.5 ${
              segment === "recurring" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            <UserCheck size={13} />
            <span>Recurrentes ({kpis.recurringCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSegment("risk")}
            className={`admin-toolbar-pill flex items-center gap-1.5 ${
              segment === "risk" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            <AlertTriangle size={13} />
            <span>En Riesgo ({kpis.riskCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSegment("new")}
            className={`admin-toolbar-pill flex items-center gap-1.5 ${
              segment === "new" ? "admin-toolbar-pill--active" : ""
            }`}
          >
            <Sparkles size={13} />
            <span>Nuevos ({kpis.newCount})</span>
          </button>
        </div>

        {/* Secondary controls: Search, Risk threshold, Backfill, CSV */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-xs text-[var(--dash-muted)]">
            <span>Riesgo:</span>
            <select
              value={riskDays}
              onChange={(e) => setRiskDays(Number(e.target.value))}
              className="bg-transparent text-[var(--dash-text)] font-semibold outline-none cursor-pointer"
            >
              <option value={30}>+30 días</option>
              <option value={45}>+45 días</option>
              <option value={60}>+60 días</option>
              <option value={90}>+90 días</option>
            </select>
          </div>

          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar cliente, tel, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 py-1.5 text-xs w-full"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleBackfill}
            disabled={backfilling}
            loading={backfilling}
            icon={<RefreshCw size={13} />}
          >
            <span className="hidden sm:inline">Sincronizar</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportCustomersCsv(customers)}
            disabled={customers.length === 0}
            icon={<Download size={13} />}
          >
            <span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      </div>

      {/* Main Customers DataTable */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <EmptyState
          icon={<Users size={28} />}
          title="Error al cargar clientes"
          description={error}
        />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title={segment === "today" ? "¡Todo al día!" : "No se encontraron clientes"}
          description={
            segment === "today"
              ? "No tenés seguimientos vencidos para hoy ni clientes inactivos según el umbral configurado."
              : search
              ? `No hay clientes que coincidan con "${search}".`
              : "Aún no hay clientes registrados."
          }
        />
      ) : (
        <div className="admin-datatable-wrapper">
          <table className="admin-datatable">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Pedidos</th>
                <th>Total Gastado</th>
                <th>Última Compra</th>
                <th>Próx. Seguimiento</th>
                <th>Etiquetas</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const cleanPhone = customer.phoneNormalized.replace(/\D/g, "");
                const waUrl = cleanPhone
                  ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `¡Hola ${customer.name}! Te escribimos de Poné La Pava en Catriel para saludarte 🧉`
                    )}`
                  : null;

                return (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="admin-row-hover cursor-pointer"
                  >
                    {/* Cliente / Nombre */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] font-bold text-xs border border-[var(--dash-accent-border)]">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <span className="font-bold text-[var(--dash-text)] text-xs block">
                            {customer.name}
                          </span>
                          <StatusPill type="segment" value={customer.segment} />
                        </div>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td className="text-xs font-mono text-[var(--dash-muted)]">
                      {customer.displayPhone || customer.phoneNormalized || "—"}
                    </td>

                    {/* Pedidos & Ticket Promedio */}
                    <td>
                      <span className="text-xs font-bold text-[var(--dash-text)] block">
                        {customer.ordersCount} pedidos
                      </span>
                      <span className="text-xs text-[var(--dash-muted)]">
                        Prom: {formatPrice(customer.averageTicket)}
                      </span>
                    </td>

                    {/* Total Gastado */}
                    <td>
                      <span className="font-serif font-bold text-sm text-[var(--dash-accent)]">
                        {formatPrice(customer.totalSpent)}
                      </span>
                    </td>

                    {/* Última Compra */}
                    <td className="text-xs text-[var(--dash-muted)]">
                      {customer.daysSinceLastOrder !== null ? (
                        <div>
                          <span
                            className={
                              customer.daysSinceLastOrder >= riskDays
                                ? "text-[var(--dash-warning)] font-bold"
                                : "text-[var(--dash-text)]"
                            }
                          >
                            Hace {customer.daysSinceLastOrder} días
                          </span>
                          <span className="text-xs block opacity-70">
                            {new Date(customer.lastOrderDate!).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Próximo Seguimiento */}
                    <td className="text-xs">
                      {customer.followUpAt ? (
                        <span
                          className={`admin-badge ${
                            customer.isFollowUpOverdue
                              ? "admin-badge--danger"
                              : "admin-badge--neutral"
                          }`}
                        >
                          <Calendar size={11} />
                          <span>
                            {new Date(customer.followUpAt).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[var(--dash-muted)] text-xs">—</span>
                      )}
                    </td>

                    {/* Etiquetas */}
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {customer.tags && customer.tags.length > 0 ? (
                          customer.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="admin-badge admin-badge--neutral text-xs"
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-[var(--dash-muted)] text-xs">—</span>
                        )}
                        {customer.tags && customer.tags.length > 2 && (
                          <span className="text-xs text-[var(--dash-muted)]">
                            +{customer.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-icon-btn text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "#25d366", borderColor: "#25d366" }}
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className="admin-icon-btn"
                          title="Ver Ficha CRM"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerToDelete(customer)}
                          className="admin-icon-btn hover:text-[var(--dash-danger)] hover:border-[var(--dash-danger-border)] transition-colors"
                          title="Eliminar Cliente"
                        >
                          <Trash2 size={14} />
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

      {/* Customer Detail Drawer with Tabs (Resumen, Pedidos, Notas) */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onCustomerUpdated={() => {
            loadCustomers();
          }}
        />
      )}

      {customerToDelete && (
        <ConfirmDialog
          title="¿Eliminar cliente del CRM?"
          message={`¿Estás seguro de que deseas eliminar permanentemente a "${customerToDelete.name}" (${customerToDelete.displayPhone || customerToDelete.phoneNormalized})? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar cliente"
          onConfirm={() => handleDeleteCustomer(customerToDelete)}
          onCancel={() => setCustomerToDelete(null)}
        />
      )}
    </div>
  );
}
