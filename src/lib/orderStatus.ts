import type { Order } from "@/types";

export const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const STATUS_COLORS: Record<
  Order["status"],
  { color: string; bg: string }
> = {
  pending: { color: "var(--dash-accent)", bg: "rgba(199,166,122,0.12)" },
  confirmed: { color: "var(--dash-success)", bg: "var(--dash-success-bg)" },
  delivered: { color: "var(--dash-muted)", bg: "var(--dash-surface-2)" },
  cancelled: { color: "var(--dash-danger)", bg: "var(--dash-danger-bg)" },
};

export const ORDER_STATUSES: Order["status"][] = [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
];

export function isOrderStatus(value: unknown): value is Order["status"] {
  return ORDER_STATUSES.includes(value as Order["status"]);
}

