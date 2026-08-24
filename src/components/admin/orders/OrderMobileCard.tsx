"use client";

import { Eye } from "lucide-react";
import { Order } from "@/types";
import { formatPrice, truncate } from "@/lib/utils";
import { OrderStatusSelect } from "./OrderStatusSelect";

export function OrderMobileCard({
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
  const itemsSummary = order.items
    .map((i) => `${i.productName} x${i.quantity}`)
    .join(", ");

  return (
    <div
      className="admin-row-in"
      style={
        {
          padding: 14,
          background: "var(--dash-surface)",
          border: "1px solid var(--dash-border)",
          borderRadius: 10,
          "--i": index,
        } as React.CSSProperties
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(order.id!)}
          aria-label={`Seleccionar pedido de ${order.customerName}`}
          style={{ flexShrink: 0, marginTop: 3 }}
        />
        <button
          onClick={() => onView(order)}
          className="admin-link-btn"
          style={{ padding: 0, background: "none", minWidth: 0, flex: 1 }}
        >
          <Eye size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
          <span
            style={{
              fontWeight: 500,
              color: "var(--dash-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {order.customerName}
          </span>
        </button>
        <span
          style={{
            fontSize: 12,
            color: "var(--dash-muted)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {new Date(order.createdAt).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
          })}
        </span>
      </div>

      <p
        style={{
          fontSize: 12,
          color: "var(--dash-muted)",
          marginTop: 6,
        }}
      >
        {truncate(itemsSummary, 70)}
      </p>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--dash-border)",
          paddingTop: 10,
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>
          {formatPrice(order.total)}
        </span>
        <OrderStatusSelect
          status={order.status}
          onChange={(status) => onStatusChange(order.id!, status)}
        />
      </div>
    </div>
  );
}
