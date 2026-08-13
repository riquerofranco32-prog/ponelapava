"use client";

import { Product } from "@/types";

const STATUS_MAP = {
  available: {
    label: "Disponible",
    color: "var(--dash-success)",
    bg: "var(--dash-success-bg)",
  },
  featured: {
    label: "Destacado",
    color: "var(--dash-accent)",
    bg: "rgba(199,166,122,0.12)",
  },
  out_of_stock: {
    label: "Agotado",
    color: "var(--dash-danger)",
    bg: "var(--dash-danger-bg)",
  },
} as const;

export function StatusBadge({ status }: { status: Product["status"] }) {
  const { label, color, bg } = STATUS_MAP[status];
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color,
        background: bg,
      }}
    >
      {label}
    </span>
  );
}
