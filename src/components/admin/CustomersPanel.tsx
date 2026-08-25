"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  Award,
  DollarSign,
  Search,
  MessageCircle,
  Eye,
  Download,
  Phone,
  ShoppingBag,
  TrendingUp,
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
  const header = ["Nombre", "Telefono", "Pedidos", "Total Gastado", "Ultimo Pedido", "Productos Favoritos"];
  const rows = customers.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    `"${(c.phone || "").replace(/"/g, '""')}"`,
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
  a.download = `clientes-ponelapava-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CustomersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<"all" | "vip" | "single">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/orders");
        assertOk(res, "No se pudieron cargar los pedidos para generar la base de clientes");
        setOrders(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Aggregate orders by customer name / phone
  const customers = useMemo(() => {
    const map = new Map<string, CustomerData>();

    orders.forEach((o) => {
      // Key by phone if available, or normalized name
      const key = o.customerPhone?.trim() || o.customerName.trim().toLowerCase();
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

    // Compute favorite products per customer
    const list = Array.from(map.values());
    list.forEach((c) => {
      const prodMap = new Map<string, number>();
      c.orders.forEach((ord) => {
        ord.items.forEach((it) => {
          prodMap.set(it.productName, (prodMap.get(it.productName) || 0) + it.quantity);
        });
      });
      c.favoriteProducts = Array.from(prodMap.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);
    });

    // Sort by total spent by default
    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Filtered list
  const filtered = useMemo(() => {
    let res = customers;

    if (segment === "vip") {
      res = res.filter((c) => c.ordersCount > 1);
    } else if (segment === "single") {
      res = res.filter((c) => c.ordersCount === 1);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q))
      );
    }

    return res;
  }, [customers, segment, search]);

  // Overall KPIs
  const totalCustomers = customers.length;
  const vipCustomers = customers.filter((c) => c.ordersCount > 1).length;
  const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgLtv = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

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
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminKpiCard
          label="Total Clientes"
          value={totalCustomers}
          icon={Users}
        />
        <AdminKpiCard
          label="Clientes VIP (+1 compra)"
          value={vipCustomers}
          icon={Award}
        />
        <AdminKpiCard
          label="Gasto Promedio (LTV)"
          value={formatPrice(avgLtv)}
          icon={TrendingUp}
        />
        <AdminKpiCard
          label="Facturación Acumulada"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
        />
      </div>

      {/* Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Segment buttons */}
          <button
            type="button"
            onClick={() => setSegment("all")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
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
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
              segment === "vip"
                ? "bg-[var(--dash-accent)] text-[#182b1d]"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            ⭐ VIP Recurrentes ({vipCustomers})
          </button>
          <button
            type="button"
            onClick={() => setSegment("single")}
            className={`rounded-control px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
              segment === "single"
                ? "bg-[var(--dash-accent)] text-[#182b1d]"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-text)]/70 hover:text-[var(--dash-text)]"
            }`}
          >
            Nuevos / 1 Pedido ({totalCustomers - vipCustomers})
          </button>
        </div>

        <div className="flex items-center gap-2">
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
            <Download size={14} />
            Exportar CSV
          </AdminButton>
        </div>
      </div>

      {/* Table of Customers */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No se encontraron clientes"
          description={
            search
              ? "Probá ajustando los términos de búsqueda."
              : "Aún no hay clientes registrados con pedidos."
          }
        />
      ) : (
        <div className="rounded-card border border-[var(--dash-border)] bg-[var(--dash-surface)] overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--dash-text)]">
              <thead className="bg-[var(--dash-surface-2)] border-b border-[var(--dash-border)] text-[10px] uppercase font-bold tracking-wider text-[var(--dash-text)]/70">
                <tr>
                  <th className="p-3.5 pl-5">Cliente</th>
                  <th className="p-3.5">Contacto</th>
                  <th className="p-3.5 text-center">Pedidos</th>
                  <th className="p-3.5">Total Gastado</th>
                  <th className="p-3.5">Última Compra</th>
                  <th className="p-3.5">Favoritos</th>
                  <th className="p-3.5 pr-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-border)]">
                {filtered.map((c) => {
                  const cleanPhone = c.phone?.replace(/\D/g, "");
                  const whatsappUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone.startsWith("54") ? cleanPhone : `54${cleanPhone}`}?text=${encodeURIComponent(
                        `¡Hola ${c.name}! Te escribimos de Poné La Pava. ¿Cómo estás?`
                      )}`
                    : null;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[var(--dash-surface-2)]/60 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="p-3.5 pl-5 font-semibold text-[var(--dash-text)]">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--dash-accent)]/20 text-[var(--dash-accent)] font-bold text-xs">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <span>{c.name}</span>
                            {c.ordersCount > 1 && (
                              <span className="ml-1.5 rounded-chip bg-[var(--dash-accent)]/20 text-[var(--dash-accent)] border border-[var(--dash-accent)]/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                                VIP
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="p-3.5 text-[var(--dash-text)]/80">
                        {c.phone ? (
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone size={11} className="text-[var(--dash-text)]/40" />
                            {c.phone}
                          </span>
                        ) : (
                          <span className="text-[var(--dash-text)]/30">–</span>
                        )}
                      </td>

                      {/* Orders count */}
                      <td className="p-3.5 text-center">
                        <span className="inline-block rounded-full bg-[var(--dash-surface-3)] px-2 py-0.5 font-bold text-[11px]">
                          {c.ordersCount}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="p-3.5 font-bold text-[var(--dash-accent)]">
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
                            {c.favoriteProducts[0].name} (x{c.favoriteProducts[0].quantity})
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
                              className="p-1.5 rounded-control text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                              title="Escribir por WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            aria-label={`Ver ficha de ${c.name}`}
                            className="p-1.5 rounded-control text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-3)] transition-colors cursor-pointer"
                            title="Ver ficha completa"
                          >
                            <Eye size={15} />
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
