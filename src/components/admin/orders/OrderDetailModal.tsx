"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle, Printer } from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { buildAdminCustomerWhatsAppUrl } from "@/lib/whatsapp";
import { printOrderRemito } from "@/lib/orderPrint";
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
  if (order.customerPhone) lines.push(`Teléfono: ${order.customerPhone}`);
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

  function handlePrint() {
    printOrderRemito(order);
  }

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

  const hasPhone = Boolean(order.customerPhone && order.customerPhone.trim().length > 5);

  return (
    <AdminModal
      title={`Pedido de ${order.customerName}`}
      onClose={onClose}
      maxWidth={480}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            gap: 10,
          }}
        >
          <div>
            {hasPhone && (
              <a
                href={buildAdminCustomerWhatsAppUrl(
                  order.customerPhone!,
                  order.customerName,
                  order.total,
                  order.status === "confirmed" ? "confirmed" : order.status === "delivered" ? "delivered" : "general"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "var(--color-whatsapp, #25d366)",
                  borderColor: "var(--color-whatsapp, #25d366)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-control, 8px)",
                }}
              >
                <MessageCircle size={15} />
                WhatsApp al cliente
              </a>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {copyError && (
              <span style={{ fontSize: 12, color: "var(--dash-danger)" }}>
                No se pudo copiar
              </span>
            )}
            <AdminButton variant="secondary" onClick={handlePrint} title="Imprimir ticket para empaque o despacho">
              <Printer size={14} />
              Imprimir
            </AdminButton>
            <AdminButton variant="secondary" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado" : "Copiar resumen"}
            </AdminButton>
          </div>
        </div>
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "var(--dash-muted)",
        }}
      >
        <span>
          {new Date(order.createdAt).toLocaleString("es-AR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </span>
        {order.customerPhone && (
          <span style={{ color: "var(--dash-text)", fontWeight: 500 }}>
            📞 {order.customerPhone}
          </span>
        )}
      </div>

      {/* Payment & Delivery Badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0 6px" }}>
        {order.paymentMethod && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: "var(--radius-chip, 4px)",
              background: order.paymentMethod === "transfer" ? "rgba(16, 185, 129, 0.15)" : "var(--dash-surface-2)",
              color: order.paymentMethod === "transfer" ? "#10b981" : "var(--dash-text)",
              border: "1px solid var(--dash-border)",
            }}
          >
            {order.paymentMethod === "transfer" ? "💳 Transferencia (10% OFF)" : order.paymentMethod === "cash" ? "💵 Efectivo (10% OFF)" : "💳 Tarjeta"}
          </span>
        )}
        {order.deliveryMethod && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: "var(--radius-chip, 4px)",
              background: order.deliveryMethod === "pickup" ? "rgba(199, 166, 122, 0.15)" : "var(--dash-surface-2)",
              color: order.deliveryMethod === "pickup" ? "var(--dash-accent)" : "var(--dash-text)",
              border: "1px solid var(--dash-border)",
            }}
          >
            {order.deliveryMethod === "pickup" ? "🏪 Retiro en Local" : "🛵 Envío a Domicilio"}
          </span>
        )}
        {order.couponCode && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: "var(--radius-chip, 4px)",
              background: "rgba(199, 166, 122, 0.15)",
              color: "var(--dash-accent)",
              border: "1px solid var(--dash-border)",
            }}
          >
            🏷️ Cupón: {order.couponCode}
          </span>
        )}
      </div>

      {order.deliveryAddress && (
        <div
          style={{
            fontSize: 12,
            padding: "8px 10px",
            background: "var(--dash-surface-2)",
            borderRadius: 6,
            border: "1px solid var(--dash-border)",
            color: "var(--dash-text)",
            margin: "4px 0 10px",
          }}
        >
          <span style={{ color: "var(--dash-muted)", fontWeight: 600 }}>📍 Dirección: </span>
          {order.deliveryAddress}
        </div>
      )}

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

      {/* Subtotal, discounts, shipping */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--dash-muted)", paddingTop: 4 }}>
        {order.discount && order.discount > 0 ? (
          <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981" }}>
            <span>Descuento aplicado</span>
            <span>-{formatPrice(order.discount)}</span>
          </div>
        ) : null}
        {order.shippingCost && order.shippingCost > 0 ? (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Costo de envío</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>
        ) : null}
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
          paddingTop: 8,
          borderTop: "1px solid var(--dash-border)",
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
