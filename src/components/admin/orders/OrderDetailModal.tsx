"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminButton } from "@/components/admin/AdminButton";

function buildSummary(order: Order): string {
  const lines = [
    `Pedido de ${order.customerName}`,
    new Date(order.createdAt).toLocaleString("es-AR"),
    "",
    ...order.items.map(
      (i) => `${i.quantity}x ${i.productName} — ${formatPrice(i.subtotal)}`,
    ),
    "",
    `Total: ${formatPrice(order.total)}`,
  ];
  if (order.comment) lines.push("", `Comentario: ${order.comment}`);
  return lines.join("\n");
}

export function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildSummary(order));
      setCopyError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }

  return (
    <AdminModal
      title={`Pedido de ${order.customerName}`}
      onClose={onClose}
      maxWidth={480}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 10,
          }}
        >
          {copyError && (
            <span style={{ fontSize: 12, color: "var(--dash-danger)" }}>
              No se pudo copiar
            </span>
          )}
          <AdminButton variant="secondary" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copiado" : "Copiar resumen"}
          </AdminButton>
        </div>
      }
    >
      <div
        style={{
          fontSize: 12,
          color: "var(--dash-muted)",
        }}
      >
        {new Date(order.createdAt).toLocaleString("es-AR", {
          dateStyle: "long",
          timeStyle: "short",
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          borderTop: "1px solid var(--dash-border)",
          borderBottom: "1px solid var(--dash-border)",
          padding: "14px 0",
        }}
      >
        {order.items.map((item) => (
          <div
            key={item.productId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 14, color: "var(--dash-text)" }}>
              <span style={{ color: "var(--dash-muted)" }}>
                {item.quantity}x
              </span>{" "}
              {item.productName}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--dash-text)",
                whiteSpace: "nowrap",
              }}
            >
              {formatPrice(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      {order.comment && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--dash-muted)",
              marginBottom: 4,
            }}
          >
            Comentario
          </div>
          <p style={{ fontSize: 14, color: "var(--dash-text)" }}>
            {order.comment}
          </p>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span style={{ fontSize: 14, color: "var(--dash-muted)" }}>Total</span>
        <span
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--dash-text)",
          }}
        >
          {formatPrice(order.total)}
        </span>
      </div>
    </AdminModal>
  );
}
