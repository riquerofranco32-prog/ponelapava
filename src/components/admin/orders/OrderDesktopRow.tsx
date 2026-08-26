"use client";

import { Eye, MessageCircle, Printer } from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { buildAdminCustomerWhatsAppUrl } from "@/lib/whatsapp";
import { printOrderRemito } from "@/lib/orderPrint";
import { OrderStatusSelect } from "./OrderStatusSelect";

const td: React.CSSProperties = {
  padding: "12px 14px",
  borderTop: "1px solid var(--dash-border)",
  verticalAlign: "top",
};

export function OrderDesktopRow({
  order,
  index,
  onStatusChange,
  onView,
  selected,
  onToggleSelect,
}: {
  order: Order;
  index: number;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onView: (order: Order) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <tr
      className="admin-row-in admin-row-hover"
      style={{ "--i": index } as React.CSSProperties}
    >
      <td style={{ ...td, width: 32 }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(order.id!)}
          aria-label={`Seleccionar pedido de ${order.customerName}`}
        />
      </td>
      <td style={td}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => onView(order)}
            className="admin-link-btn"
            style={{
              padding: 0,
              background: "none",
              fontWeight: 500,
              color: "var(--dash-text)",
              gap: 6,
            }}
          >
            <Eye size={13} style={{ opacity: 0.6 }} />
            {order.customerName}
          </button>

          <button
            type="button"
            onClick={() => printOrderRemito(order)}
            title="Imprimir remito de despacho / checklist"
            style={{
              background: "none",
              border: "none",
              color: "var(--dash-muted)",
              padding: 2,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 4,
            }}
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
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-whatsapp, #25d366)",
                padding: 2,
                borderRadius: 4,
                opacity: 0.8,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
            >
              <MessageCircle size={14} />
            </a>
          )}
        </div>
        {order.comment && (
          <span
            style={{
              display: "block",
              fontSize: 12,
              color: "var(--dash-muted)",
              marginTop: 2,
              maxWidth: 220,
            }}
          >
            {order.comment}
          </span>
        )}
      </td>
      <td style={{ ...td, color: "var(--dash-muted)", maxWidth: 280 }}>
        {order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
      </td>
      <td style={{ ...td, fontWeight: 500, color: "var(--dash-text)" }}>
        {formatPrice(order.total)}
      </td>
      <td style={{ ...td, color: "var(--dash-muted)", whiteSpace: "nowrap" }}>
        {new Date(order.createdAt).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td style={td}>
        <OrderStatusSelect
          status={order.status}
          onChange={(status) => onStatusChange(order.id!, status)}
        />
      </td>
    </tr>
  );
}
