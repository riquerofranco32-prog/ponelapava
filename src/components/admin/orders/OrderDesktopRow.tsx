"use client";

import { Eye, MessageCircle, Printer, Trash2 } from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { buildAdminCustomerWhatsAppUrl } from "@/lib/whatsapp";
import { printOrderRemito } from "@/lib/orderPrint";
import { OrderStatusSelect } from "./OrderStatusSelect";

export function OrderDesktopRow({
  order,
  index,
  onStatusChange,
  onPaymentStatusChange,
  onView,
  onDelete,
  selected,
  onToggleSelect,
}: {
  order: Order;
  index: number;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onPaymentStatusChange?: (id: string, status: "unpaid" | "paid") => void;
  onView: (order: Order) => void;
  onDelete?: (order: Order) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <tr
      className="admin-row-in admin-row-hover"
      style={{ "--i": index } as React.CSSProperties}
    >
      <td className="w-8 p-3.5 border-t border-[var(--dash-border)] align-top">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(order.id!)}
          aria-label={`Seleccionar pedido de ${order.customerName}`}
        />
      </td>
      <td className="p-3.5 border-t border-[var(--dash-border)] align-top">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onView(order)}
            className="admin-link-btn p-0 bg-transparent font-medium text-[var(--dash-text)] gap-1.5 flex items-center hover:underline"
          >
            <Eye size={13} className="opacity-60" />
            <span>{order.customerName}</span>
          </button>

          <button
            type="button"
            onClick={() => printOrderRemito(order)}
            title="Imprimir remito de despacho / checklist"
            className="bg-transparent border-none text-[var(--dash-muted)] p-0.5 cursor-pointer inline-flex items-center rounded hover:text-[var(--dash-text)]"
          >
            <Printer size={13} />
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
              title={`Chatear con ${order.customerName} por WhatsApp`}
              className="inline-flex items-center justify-center text-[#25d366] p-0.5 rounded opacity-80 hover:opacity-100 transition-opacity"
            >
              <MessageCircle size={14} />
            </a>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(order)}
              title="Eliminar pedido permanentemente"
              className="bg-transparent border-none text-[var(--dash-muted)] p-0.5 cursor-pointer inline-flex items-center rounded hover:text-[var(--dash-danger)] transition-colors opacity-70 hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
        {order.comment && (
          <span className="block text-xs text-[var(--dash-muted)] mt-0.5 max-w-[220px] truncate">
            {order.comment}
          </span>
        )}
      </td>
      <td className="p-3.5 border-t border-[var(--dash-border)] align-top text-[var(--dash-muted)] max-w-[280px] text-xs">
        {order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
      </td>
      <td className="p-3.5 border-t border-[var(--dash-border)] align-top font-semibold text-[var(--dash-text)] whitespace-nowrap">
        {formatPrice(order.total)}
      </td>
      <td className="p-3.5 border-t border-[var(--dash-border)] align-top">
        <button
          type="button"
          onClick={() =>
            onPaymentStatusChange?.(
              order.id!,
              order.paymentStatus === "paid" ? "unpaid" : "paid",
            )
          }
          title={
            order.paymentStatus === "paid"
              ? order.paidAt
                ? `Cobrado el ${new Date(order.paidAt).toLocaleString("es-AR")}. Clic para cambiar a sin cobrar.`
                : "Cobrado. Clic para cambiar a sin cobrar."
              : "Sin cobrar. Clic para marcar como cobrado."
          }
          className={`inline-flex items-center gap-1 border-none rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            onPaymentStatusChange ? "cursor-pointer" : "cursor-default"
          } ${
            order.paymentStatus === "paid"
              ? "bg-[var(--dash-success-bg)] text-[var(--dash-success)] border border-[var(--dash-success-border)]"
              : "bg-[var(--dash-warning-bg)] text-[var(--dash-warning)] border border-[var(--dash-warning-border)]"
          }`}
        >
          {order.paymentStatus === "paid" ? "Cobrado" : "Sin cobrar"}
        </button>
        {order.paymentStatus === "paid" && order.paidAt && (
          <span className="block text-xs text-[var(--dash-muted)] mt-1">
            {new Date(order.paidAt).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </td>
      <td className="p-3.5 border-t border-[var(--dash-border)] align-top text-[var(--dash-muted)] text-xs whitespace-nowrap">
        {new Date(order.createdAt).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="p-3.5 border-t border-[var(--dash-border)] align-top">
        <OrderStatusSelect
          status={order.status}
          onChange={(status) => onStatusChange(order.id!, status)}
        />
      </td>
    </tr>
  );
}
