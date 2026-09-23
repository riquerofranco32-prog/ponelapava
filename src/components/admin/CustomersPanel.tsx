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
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AdminKpiCard } from "./AdminCard";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { assertOk } from "@/lib/admin-fetch";
import { useAdminToast } from "./AdminToast";
import { CustomerWithStats, CustomersKpis, CustomerSegment } from "@/lib/customers";
import { CustomerDetailModal } from "./CustomerDetailModal";

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
  const [backfilling, setBackfilling] = useState(false);
  const showToast = useAdminToast();

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
    loadCustomers();
  }, [loadCustomers]);

  async function handleBackfill() {
    setBackfilling(true);
    try {
      const res = await fetch("/api/admin/customers/backfill", { method: "POST" });
      assertOk(res, "Error al sincronizar clientes históricos");
      const result = await res.json();
      showToast(
        `Sincronización completa: ${result.linkedOrders} pedidos vinculados en ${result.mergedCustomers} clientes`,
      );
      loadCustomers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error en sincronización", "error");
    } finally {
      setBackfilling(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* CRM KPI Cards */}
      <div className="admin-kpi-grid">
        <AdminKpiCard
          label="Total de Clientes"
          value={kpis.totalCustomers}
          icon={Users}
        />
        <AdminKpiCard
          label="Seguimientos Pendientes (Hoy)"
          value={kpis.todayPendingCount}
          icon={Calendar}
        />
        <AdminKpiCard
          label="Clientes VIP / Clave"
          value={kpis.vipCount}
          icon={Crown}
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-none w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setSegment("today")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              segment === "today"
                ? "bg-amber-500 text-stone-900 shadow-sm"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            <span>⭐ Hoy</span>
            {kpis.todayPendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-stone-900 text-amber-400">
                {kpis.todayPendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSegment("all")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              segment === "all"
                ? "bg-[var(--dash-accent)] text-[#182b1d]"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            Todos ({kpis.totalCustomers})
          </button>
          <button
            type="button"
            onClick={() => setSegment("vip")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              segment === "vip"
                ? "bg-amber-400 text-[#182b1d] shadow-sm"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            👑 VIPs ({kpis.vipCount})
          </button>
          <button
            type="button"
            onClick={() => setSegment("recurring")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              segment === "recurring"
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            🔄 Recurrentes ({kpis.recurringCount})
          </button>
          <button
            type="button"
            onClick={() => setSegment("risk")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              segment === "risk"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            ⚠️ En Riesgo ({kpis.riskCount})
          </button>
          <button
            type="button"
            onClick={() => setSegment("new")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              segment === "new"
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            ✨ Nuevos ({kpis.newCount})
          </button>
        </div>

        {/* Secondary controls: Search, Risk threshold, Backfill, CSV */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Risk Days Configurator */}
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text)]/40 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar cliente, tel, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 py-2 text-xs w-full"
            />
          </div>

          <button
            type="button"
            onClick={handleBackfill}
            disabled={backfilling}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control bg-[var(--dash-surface-2)] hover:bg-[var(--dash-surface-3)] text-xs font-semibold text-[var(--dash-text)] border border-[var(--dash-border)] transition-colors cursor-pointer disabled:opacity-50"
            title="Asociar pedidos históricos huérfanos a clientes por número de teléfono"
          >
            <RefreshCw size={13} className={backfilling ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sincronizar Histórico</span>
          </button>

          <button
            type="button"
            onClick={() => exportCustomersCsv(customers)}
            disabled={customers.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control bg-[var(--dash-surface-2)] hover:bg-[var(--dash-surface-3)] text-xs font-semibold text-[var(--dash-text)] border border-[var(--dash-border)] transition-colors cursor-pointer disabled:opacity-40 shrink-0"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Main Customers Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <EmptyState
          icon={Users}
          title="Error al cargar clientes"
          description={error}
        />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
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
        <div className="admin-table-container">
          <table className="admin-table">
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
                      `¡Hola ${customer.name}! Te escribimos de Poné La Pava en Catriel para saludarte 🧉`,
                    )}`
                  : null;

                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-[var(--dash-surface-2)]/50 transition-colors"
                  >
                    {/* Cliente / Nombre */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--dash-accent)]/20 text-[var(--dash-accent)] font-bold text-xs">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <span className="font-bold text-[var(--dash-text)] text-xs block">
                            {customer.name}
                          </span>
                          <span className="text-[10px]">
                            {customer.segment === "vip" && (
                              <span className="text-amber-400 font-bold">👑 VIP</span>
                            )}
                            {customer.segment === "recurring" && (
                              <span className="text-emerald-400 font-bold">🔄 Recurrente</span>
                            )}
                            {customer.segment === "risk" && (
                              <span className="text-orange-400 font-bold">⚠️ En Riesgo</span>
                            )}
                            {customer.segment === "new" && (
                              <span className="text-blue-400 font-bold">✨ Nuevo</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td className="text-xs font-mono text-[var(--dash-text)]/85">
                      {customer.displayPhone || customer.phoneNormalized || "—"}
                    </td>

                    {/* Pedidos & Ticket Promedio */}
                    <td>
                      <span className="text-xs font-bold text-[var(--dash-text)] block">
                        {customer.ordersCount} pedidos
                      </span>
                      <span className="text-[11px] text-[var(--dash-muted)]">
                        Prom: {formatPrice(customer.averageTicket)}
                      </span>
                    </td>

                    {/* Total Gastado */}
                    <td>
                      <span className="font-display font-bold text-sm text-[var(--dash-text)]">
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
                                ? "text-orange-400 font-bold"
                                : "text-[var(--dash-text)]"
                            }
                          >
                            Hace {customer.daysSinceLastOrder} días
                          </span>
                          <span className="text-[10px] block opacity-70">
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
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            customer.isFollowUpOverdue
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-[var(--dash-surface-2)] text-[var(--dash-text)] border border-[var(--dash-border)]"
                          }`}
                        >
                          <Calendar size={11} />
                          <span>
                            {new Date(customer.followUpAt).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          {customer.isFollowUpOverdue && (
                            <span className="text-[9px] uppercase tracking-wider text-red-400">
                              (Vencido)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--dash-muted)] text-[11px]">—</span>
                      )}
                    </td>

                    {/* Etiquetas */}
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {customer.tags && customer.tags.length > 0 ? (
                          customer.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-[var(--dash-text)]"
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-[var(--dash-muted)] text-[11px]">—</span>
                        )}
                        {customer.tags && customer.tags.length > 2 && (
                          <span className="text-[10px] text-[var(--dash-muted)]">
                            +{customer.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-1.5 rounded-lg hover:bg-[var(--dash-surface-3)] text-[var(--dash-muted)] hover:text-[var(--dash-accent)] transition-colors cursor-pointer"
                          title="Ver ficha completa de cliente"
                        >
                          <Eye size={15} />
                        </button>
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-[var(--dash-muted)] hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Escribir por WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail & CRM Follow-up Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onCustomerUpdated={() => {
            loadCustomers();
          }}
        />
      )}
    </div>
  );
}
