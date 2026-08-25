"use client";

import { X, MessageCircle, ShoppingBag, Calendar, Phone, DollarSign, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/orderStatus";
import { AdminButton } from "./AdminButton";

export interface CustomerData {
  id: string;
  name: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: {
    id?: string;
    total: number;
    status: string;
    createdAt: string;
    items: { productName: string; quantity: number; price: number }[];
    comment?: string;
  }[];
  favoriteProducts: { name: string; quantity: number }[];
}

interface CustomerDetailModalProps {
  customer: CustomerData | null;
  onClose: () => void;
}

export function CustomerDetailModal({
  customer,
  onClose,
}: CustomerDetailModalProps) {
  if (!customer) return null;

  const cleanPhone = customer.phone?.replace(/\D/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("54") ? cleanPhone : `54${cleanPhone}`}?text=${encodeURIComponent(
        `¡Hola ${customer.name}! Te escribimos de Poné La Pava. ¿Cómo estás?`
      )}`
    : null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-card bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 sm:p-8 text-[var(--dash-text)] shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--dash-border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--dash-accent)]/20 text-[var(--dash-accent)] font-bold text-sm">
                {customer.name.charAt(0).toUpperCase()}
              </span>
              <h2 className="text-xl font-bold text-[var(--dash-text)]">
                {customer.name}
              </h2>
            </div>
            {customer.phone && (
              <p className="text-xs text-[var(--dash-text)]/60 mt-1 flex items-center gap-1">
                <Phone size={12} /> {customer.phone}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-control p-1.5 text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-control bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dash-accent)] block">
              Total Gastado
            </span>
            <span className="text-lg font-bold text-[var(--dash-text)]">
              {formatPrice(customer.totalSpent)}
            </span>
          </div>
          <div className="p-3.5 rounded-control bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dash-accent)] block">
              Pedidos
            </span>
            <span className="text-lg font-bold text-[var(--dash-text)]">
              {customer.ordersCount}
            </span>
          </div>
          <div className="p-3.5 rounded-control bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dash-accent)] block">
              Ticket Promedio
            </span>
            <span className="text-lg font-bold text-[var(--dash-text)]">
              {formatPrice(Math.round(customer.totalSpent / (customer.ordersCount || 1)))}
            </span>
          </div>
        </div>

        {/* Top products purchased */}
        {customer.favoriteProducts.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] mb-3 flex items-center gap-1.5">
              <Package size={14} /> Productos Favoritos / Más Comprados
            </h3>
            <div className="flex flex-wrap gap-2">
              {customer.favoriteProducts.map((p) => (
                <span
                  key={p.name}
                  className="rounded-chip bg-[var(--dash-surface-2)] border border-[var(--dash-border)] px-3 py-1.5 text-xs text-[var(--dash-text)] font-medium flex items-center gap-1.5"
                >
                  <span>{p.name}</span>
                  <span className="text-[10px] font-bold text-[var(--dash-accent)] bg-[var(--dash-surface-3)] px-1.5 py-0.5 rounded-full">
                    x{p.quantity}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Orders History */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] mb-3 flex items-center gap-1.5">
            <ShoppingBag size={14} /> Historial de Pedidos ({customer.orders.length})
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {customer.orders.map((o, idx) => (
              <div
                key={o.id || idx}
                className="p-3.5 rounded-control bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[var(--dash-text)]/60 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(o.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--dash-text)]">
                      {formatPrice(o.total)}
                    </span>
                    <span className="rounded-chip px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--dash-surface-3)] border border-[var(--dash-border)]">
                      {STATUS_LABELS[o.status as keyof typeof STATUS_LABELS] || o.status}
                    </span>
                  </div>
                </div>
                <div className="text-[var(--dash-text)]/80 text-[11px] pl-2 border-l border-[var(--dash-border)] space-y-0.5">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>• {item.productName} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                {o.comment && (
                  <p className="text-[11px] italic text-[var(--dash-text)]/60">
                    Nota: &ldquo;{o.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--dash-border)]">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-control bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              <MessageCircle size={15} />
              Escribir por WhatsApp
            </a>
          )}
          <AdminButton variant="secondary" onClick={onClose}>
            Cerrar
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
