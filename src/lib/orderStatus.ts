import type { Order } from "@/types";

export const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Listo para retirar/enviar",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const STATUS_COLORS: Record<
  Order["status"],
  { color: string; bg: string }
> = {
  pending: { color: "var(--dash-accent)", bg: "rgba(199,166,122,0.12)" },
  confirmed: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  preparing: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  ready: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  delivered: { color: "var(--dash-muted)", bg: "var(--dash-surface-2)" },
  cancelled: { color: "var(--dash-danger)", bg: "var(--dash-danger-bg)" },
};

export const ORDER_STATUSES: Order["status"][] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

export function isOrderStatus(value: unknown): value is Order["status"] {
  return ORDER_STATUSES.includes(value as Order["status"]);
}

export type PaymentStatus = "unpaid" | "paid";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Sin cobrar",
  paid: "Cobrado",
};

export const PAYMENT_STATUS_COLORS: Record<
  PaymentStatus,
  { color: string; bg: string }
> = {
  unpaid: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
  paid: { color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
};

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return value === "unpaid" || value === "paid";
}

