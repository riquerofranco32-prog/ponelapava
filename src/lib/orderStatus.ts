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
  pending: { color: "var(--dash-accent)", bg: "var(--dash-accent-subtle, rgba(199,166,122,0.12))" },
  confirmed: { color: "var(--dash-info)", bg: "var(--dash-info-bg)" },
  preparing: { color: "var(--dash-info)", bg: "var(--dash-info-bg)" },
  ready: { color: "var(--dash-success)", bg: "var(--dash-success-bg)" },
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
  unpaid: { color: "var(--dash-warning)", bg: "var(--dash-warning-bg)" },
  paid: { color: "var(--dash-success)", bg: "var(--dash-success-bg)" },
};

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return value === "unpaid" || value === "paid";
}

