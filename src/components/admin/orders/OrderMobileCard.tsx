"use client";

import { Eye, MessageCircle, Printer } from "lucide-react";
import { Order } from "@/types";
import { formatPrice, truncate } from "@/lib/utils";
import { buildAdminCustomerWhatsAppUrl } from "@/lib/whatsapp";
import { printOrderRemito } from "@/lib/orderPrint";
import { OrderStatusSelect } from "./OrderStatusSelect";

export function OrderMobileCard({
  order,
  index,
  onStatusChange,
  onPaymentStatusChange,
  onView,
  selected,
  onToggleSelect,
}: {
  order: Order;
  index: number;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onPaymentStatusChange?: (id: string, status: "unpaid" | "paid") => void;
  onView: (order: Order) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const itemsSummary = order.items
    .map((i) => `${i.productName} x${i.quantity}`)
    .join(", ");

  return (
    <div
      className="admin-row-in p-3.5 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl"
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="flex justify-between items-start gap-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(order.id!)}
          aria-label={`Seleccionar pedido de ${order.customerName}`}
          className="shrink-0 mt-0.5"
        />
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <button
            onClick={() => onView(order)}
            className="admin-link-btn p-0 bg-transparent min-w-0 flex-1 flex items-center gap-1.5 text-left"
          >
            <Eye size={13} className="opacity-60 shrink-0" />
            <span className="font-semibold text-[var(--dash-text)] truncate text-xs">
              {order.customerName}
            </span>
          </button>

          <button
            type="button"
            onClick={() => printOrderRemito(order)}
            title="Imprimir remito de despacho"
            className="bg-transparent border-none text-[var(--dash-muted)] p-1 cursor-pointer inline-flex items-center shrink-0 rounded hover:text-[var(--dash-text)]"
          >
            <Printer size={14} />
          </button>

          {order.customerPhone && (
            <a
              href={buildAdminCustomerWhatsAppUrl(
                order.customerPhone,
                order.customerName,
                order.total,
                order.status === "confirmed" ? "confirmed" : order.status === "delivered" ? "delivered" : "general"
              )}
              target="_blank"
              rel="noopener noreferrer"
              title={`Chatear con ${order.customerName}`}
              className="text-[#25d366] inline-flex items-center justify-center shrink-0 p-1 rounded opacity-80 hover:opacity-100"
            >
              <MessageCircle size={15} />
            </a>
          )}
        </div>
        <span className="text-xs text-[var(--dash-muted)] whitespace-nowrap shrink-0">
          {new Date(order.createdAt).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
          })}
        </span>
      </div>

      <p className="text-xs text-[var(--dash-muted)] mt-1.5 line-clamp-2">
        {truncate(itemsSummary, 70)}
      </p>

      <div className="mt-2.5 flex items-center justify-between border-t border-[var(--dash-border)] pt-2.5 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-[var(--dash-text)]">
            {formatPrice(order.total)}
          </span>
          <button
            type="button"
            onClick={() =>
              onPaymentStatusChange?.(
                order.id!,
                order.paymentStatus === "paid" ? "unpaid" : "paid",
              )
            }
            className={`inline-flex items-center gap-1 border-none rounded-full px-2 py-0.5 text-xs font-semibold ${
              onPaymentStatusChange ? "cursor-pointer" : "cursor-default"
            } ${
              order.paymentStatus === "paid"
                ? "bg-[var(--dash-success-bg)] text-[var(--dash-success)] border border-[var(--dash-success-border)]"
                : "bg-[var(--dash-warning-bg)] text-[var(--dash-warning)] border border-[var(--dash-warning-border)]"
            }`}
          >
            {order.paymentStatus === "paid" ? "Cobrado" : "Sin cobrar"}
          </button>
        </div>
        <OrderStatusSelect
          status={order.status}
          onChange={(status) => onStatusChange(order.id!, status)}
        />
      </div>
    </div>
  );
}
