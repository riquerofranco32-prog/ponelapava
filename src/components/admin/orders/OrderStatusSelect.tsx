"use client";

import { Order } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/orderStatus";

export function OrderStatusSelect({
  status,
  onChange,
}: {
  status: Order["status"];
  onChange: (next: Order["status"]) => void;
}) {
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as Order["status"])}
      aria-label="Estado del pedido"
      style={{
        ...STATUS_COLORS[status],
        border: "none",
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      {(Object.keys(STATUS_LABELS) as Order["status"][]).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
