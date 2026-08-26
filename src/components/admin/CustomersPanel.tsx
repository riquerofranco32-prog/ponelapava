"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Award,
  DollarSign,
  Search,
  MessageCircle,
  Eye,
  Download,
  Phone,
  TrendingUp,
  Crown,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AdminKpiCard } from "./AdminCard";
import { AdminButton } from "./AdminButton";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { assertOk } from "@/lib/admin-fetch";
import { CustomerData, CustomerDetailModal } from "./CustomerDetailModal";

function exportCustomersCsv(customers: CustomerData[]) {
  const header = [
    "Nombre",
    "Telefono",
    "Segmento",
    "Pedidos",
    "Total Gastado",
    "Ultimo Pedido",
    "Productos Favoritos",
  ];
  const rows = customers.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    `"${(c.phone || "").replace(/"/g, '""')}"`,
    `"${c.segment || "new"}"`,
    c.ordersCount,
    c.totalSpent,
    `"${c.lastOrderDate}"`,
    `"${c.favoriteProducts.map((p) => `${p.name} (x${p.quantity})`).join("; ").replace(/"/g, '""')}"`,
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<
    "all" | "vip" | "recurring" | "risk" | "new"
  >("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(
    null,
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/orders");
        assertOk(
          res,
          "No se pudieron cargar los pedidos para generar la base de clientes",
        );
        setOrders(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Aggregate orders by customer name / phone with CRM segmentation
  const customers = useMemo(() => {
    const map = new Map<string, CustomerData>();
    const now = new Date().getTime();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    orders.forEach((o) => {
      const key =
        o.customerPhone?.trim() || o.customerName.trim().toLowerCase();
      const existing = map.get(key);
      const itemsList = o.items || [];

      if (!existing) {
        map.set(key, {
          id: key,
          name: o.customerName,
          phone: o.customerPhone,
          ordersCount: 1,
          totalSpent: o.total,
          lastOrderDate: o.createdAt,
          orders: [
            {
              id: o.id,
              total: o.total,
              status: o.status,
              createdAt: o.createdAt,
              items: itemsList.map((i) => ({
                productName: i.productName,
                quantity: i.quantity,
                price: i.price,
              })),
              comment: o.comment,
            },
          ],
          favoriteProducts: [],
        });
      } else {
        existing.ordersCount += 1;
        existing.totalSpent += o.total;
        if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.createdAt;
        }
        existing.orders.push({
          id: o.id,
          total: o.total,
          status: o.status,
          createdAt: o.createdAt,
          items: itemsList.map((i) => ({
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
          })),
          comment: o.comment,
        });
      }
    });

    const list = Array.from(map.values());
    list.forEach((c) => {
      // Compute favorite products
      const prodMap = new Map<string, number>();
      c.orders.forEach((ord) => {
        ord.items.forEach((it) => {
          prodMap.set(
            it.productName,
            (prodMap.get(it.productName) || 0) + it.quantity,
          );
        });
      });
      c.favoriteProducts = Array.from(prodMap.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);

      // Compute Segment
      const daysSinceLast =
        (now - new Date(c.lastOrderDate).getTime()) / MS_PER_DAY;
      if (c.totalSpent >= 90000 || c.ordersCount >= 3) {
        c.segment = "vip";
      } else if (c.ordersCount >= 2) {
        c.segment = "recurring";
      } else if (daysSinceLast > 45) {
        c.segment = "risk";
      } else {
        c.segment = "new";
      }
    });

    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Filtered list
  const filtered = useMemo(() => {
    let res = customers;

    if (segment !== "all") {
      res = res.filter((c) => c.segment === segment);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)),
      );
    }

    return res;
  }, [customers, segment, search]);

  // Overall CRM KPIs
  const totalCustomers = customers.length;
  const vipCount = customers.filter((c) => c.segment === "vip").length;
  const recurringCount = customers.filter(
    (c) => c.segment === "recurring" || c.segment === "vip",
  ).length;
  const riskCount = customers.filter((c) => c.segment === "risk").length;
  const newCount = customers.filter((c) => c.segment === "new").length;

  const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgLtv =
    totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;
  const retentionRate =
    totalCustomers > 0
      ? Math.round((recurringCount / totalCustomers) * 100)
      : 0;

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={Users}
        title="Error al cargar clientes"
        description={error}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* CRM KPI Cards */}
      <div className="admin-kpi-grid">
        <AdminKpiCard
          label="Total de Clientes"
          value={totalCustomers}
          icon={Users}
        />
        <AdminKpiCard
          label="Clientes VIP / Clave"
          value={vipCount}
          icon={Crown}
        />
        <AdminKpiCard
          label="Tasa de Recompra"
          value={`${retentionRate}%`}
          icon={Award}
        />
        <AdminKpiCard
          label="LTV Promedio"
          value={formatPrice(avgLtv)}
          icon={TrendingUp}
        />
      </div>

      {/* Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Segment Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-none w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setSegment("all")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              segment === "all"
                ? "bg-[var(--dash-accent)] text-[#182b1d]"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            Todos ({totalCustomers})
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
            👑 VIPs ({vipCount})
          </button>
          <button
            type="button"
            onClick={() => setSegment("recurring")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              segment === "recurring"
                ? "bg-emerald-500 text-white"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            🔄 Recurrentes ({customers.filter((c) => c.segment === "recurring").length})
          </button>
          <button
            type="button"
            onClick={() => setSegment("risk")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              segment === "risk"
                ? "bg-orange-500 text-white"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            ⚠️ En Riesgo ({riskCount})
          </button>
          <button
            type="button"
            onClick={() => setSegment("new")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              segment === "new"
                ? "bg-blue-500 text-white"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            🌟 Nuevos ({newCount})
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text)]/40"
            />
            <input
              type="search"
              placeholder="Buscar por nombre o celular..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-control bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] placeholder-[var(--dash-text)]/40 focus:outline-none focus:border-[var(--dash-accent)]"
            />
          </div>

          {/* Export */}
          <AdminButton
            variant="secondary"
            onClick={() => exportCustomersCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <Download size={14} style={{ marginRight: 6, display: "inline" }} />
            Exportar CRM
          </AdminButton>
        </div>
      </div>

      {/* List / Table of Customers */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No se encontraron clientes"
          description={
            search
              ? "Probá ajustando los términos de búsqueda."
              : "Aún no hay clientes registrados en este segmento."
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="admin-desktop-only rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--dash-text)]">
                <thead className="bg-[var(--dash-surface-2)] border-b border-[var(--dash-border)] text-[10px] uppercase font-bold tracking-wider text-[var(--dash-text)]/70">
                  <tr>
                    <th className="p-3.5 pl-5">Cliente & Segmento</th>
                    <th className="p-3.5">Contacto</th>
                    <th className="p-3.5 text-center">Pedidos</th>
                    <th className="p-3.5">Total Gastado (LTV)</th>
                    <th className="p-3.5">Última Compra</th>
                    <th className="p-3.5">Favoritos</th>
                    <th className="p-3.5 pr-5 text-right">Acciones CRM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--dash-border)]">
                  {filtered.map((c) => {
                    const cleanPhone = c.phone?.replace(/\D/g, "");
                    let formattedPhone = cleanPhone || "";
                    if (formattedPhone.startsWith("0"))
                      formattedPhone = formattedPhone.slice(1);
                    if (formattedPhone.length === 10)
                      formattedPhone = `549${formattedPhone}`;
                    else if (
                      formattedPhone.startsWith("54") &&
                      !formattedPhone.startsWith("549") &&
                      formattedPhone.length === 12
                    ) {
                      formattedPhone = `549${formattedPhone.slice(2)}`;
                    }

                    const whatsappUrl = formattedPhone
                      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
                          `¡Hola ${c.name}! Te escribimos de Poné La Pava. ¿Cómo estás? 🧉`,
                        )}`
                      : null;

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-[var(--dash-surface-2)]/60 transition-colors admin-stagger-item"
                      >
                        {/* Name & Segment Badge */}
                        <td className="p-3.5 pl-5 font-semibold text-[var(--dash-text)]">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--dash-accent)]/20 text-[var(--dash-accent)] font-bold text-xs">
                                {c.name.charAt(0).toUpperCase()}
                              </span>
                              {c.segment === "vip" && (
                                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-black text-[9px] font-bold shadow-sm">
                                  ★
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{c.name}</span>
                                {c.segment === "vip" && (
                                  <span className="rounded-chip bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                                    VIP
                                  </span>
                                )}
                                {c.segment === "recurring" && (
                                  <span className="rounded-chip bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                                    Recurrente
                                  </span>
                                )}
                                {c.segment === "risk" && (
                                  <span className="rounded-chip bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                                    Inactivo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="p-3.5 text-[var(--dash-text)]/80">
                          {c.phone ? (
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Phone
                                size={11}
                                className="text-[var(--dash-text)]/40"
                              />
                              {c.phone}
                            </span>
                          ) : (
                            <span className="text-[var(--dash-text)]/30">–</span>
                          )}
                        </td>

                        {/* Orders count */}
                        <td className="p-3.5 text-center">
                          <span className="inline-block rounded-full bg-[var(--dash-surface-3)] px-2.5 py-0.5 font-bold text-[11px] text-[var(--dash-text)]">
                            {c.ordersCount}
                          </span>
                        </td>

                        {/* Total Spent (LTV) */}
                        <td className="p-3.5 font-bold text-[var(--dash-accent)] text-sm">
                          {formatPrice(c.totalSpent)}
                        </td>

                        {/* Last order date */}
                        <td className="p-3.5 text-[var(--dash-text)]/70">
                          {new Date(c.lastOrderDate).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Top item */}
                        <td className="p-3.5 text-[var(--dash-text)]/75 max-w-[200px] truncate">
                          {c.favoriteProducts[0] ? (
                            <span className="truncate">
                              {c.favoriteProducts[0].name} (x
                              {c.favoriteProducts[0].quantity})
                            </span>
                          ) : (
                            <span className="text-[var(--dash-text)]/30">–</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`WhatsApp con ${c.name}`}
                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                title="Escribir por WhatsApp"
                              >
                                <MessageCircle size={15} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedCustomer(c)}
                              aria-label={`Ver ficha de ${c.name}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[var(--dash-accent)] bg-[var(--dash-surface-3)] hover:bg-[var(--dash-accent)] hover:text-[#182b1d] font-semibold text-[11px] transition-colors cursor-pointer"
                              title="Ficha CRM Completa"
                            >
                              <Eye size={13} />
                              Ficha CRM
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards List */}
          <div className="admin-mobile-only space-y-3">
            {filtered.map((c, index) => {
              const cleanPhone = c.phone?.replace(/\D/g, "");
              let formattedPhone = cleanPhone || "";
              if (formattedPhone.startsWith("0"))
                formattedPhone = formattedPhone.slice(1);
              if (formattedPhone.length === 10)
                formattedPhone = `549${formattedPhone}`;
              else if (
                formattedPhone.startsWith("54") &&
                !formattedPhone.startsWith("549") &&
                formattedPhone.length === 12
              ) {
                formattedPhone = `549${formattedPhone.slice(2)}`;
              }

              const whatsappUrl = formattedPhone
                ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
                    `¡Hola ${c.name}! Te escribimos de Poné La Pava. ¿Cómo estás? 🧉`,
                  )}`
                : null;

              return (
                <div
                  key={c.id}
                  className="admin-row-in p-4 rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] shadow-md"
                  style={{ "--i": index } as React.CSSProperties}
                >
                  {/* Top: Avatar, Name, Segment, WhatsApp */}
                  <div className="flex items-center justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--dash-accent)]/20 text-[var(--dash-accent)] font-bold text-sm">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                        {c.segment === "vip" && (
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-black text-[9px] font-bold shadow-sm">
                            ★
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[var(--dash-text)] truncate">{c.name}</span>
                          {c.segment === "vip" && (
                            <span className="rounded-chip bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider shrink-0">
                              VIP
                            </span>
                          )}
                          {c.segment === "risk" && (
                            <span className="rounded-chip bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider shrink-0">
                              Inactivo
                            </span>
                          )}
                        </div>
                        {c.phone && (
                          <span className="text-[11px] text-[var(--dash-text)]/60 font-mono block mt-0.5">
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp con ${c.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0"
                      >
                        <MessageCircle size={16} />
                      </a>
                    )}
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-[var(--dash-surface-2)] border border-[var(--dash-border)] mb-3 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--dash-muted)] block">Pedidos</span>
                      <span className="font-bold text-xs text-[var(--dash-text)]">{c.ordersCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--dash-muted)] block">LTV Gastado</span>
                      <span className="font-bold text-xs text-[var(--dash-accent)]">{formatPrice(c.totalSpent)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--dash-muted)] block">Última compra</span>
                      <span className="font-semibold text-[11px] text-[var(--dash-text)]/80">
                        {new Date(c.lastOrderDate).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {/* Favorite product & Action */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--dash-border)]">
                    <div className="text-[11px] text-[var(--dash-muted)] min-w-0 truncate">
                      {c.favoriteProducts[0] ? (
                        <span>Top: <strong className="text-[var(--dash-text)]">{c.favoriteProducts[0].name}</strong></span>
                      ) : (
                        <span>Sin favoritos</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(c)}
                      aria-label={`Ver ficha de ${c.name}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--dash-accent)] bg-[var(--dash-surface-3)] hover:bg-[var(--dash-accent)] hover:text-[#182b1d] transition-colors shrink-0"
                    >
                      <Eye size={13} />
                      Ficha CRM
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
