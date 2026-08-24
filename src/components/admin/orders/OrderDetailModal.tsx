"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle, Printer } from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { buildAdminCustomerWhatsAppUrl } from "@/lib/whatsapp";
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
    const printWindow = window.open("", "_blank", "width=600,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido - ${order.customerName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; padding: 24px; color: #111; max-width: 420px; margin: 0 auto; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px dashed #26402e; padding-bottom: 12px; margin-bottom: 14px; }
            .title { font-size: 20px; font-weight: 800; letter-spacing: 0.05em; color: #26402e; }
            .subtitle { font-size: 12px; color: #666; margin-top: 2px; }
            .meta { font-size: 13px; margin-bottom: 14px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
            .meta div { margin-bottom: 3px; }
            .items { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 14px; }
            .items th { text-align: left; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 11px; text-transform: uppercase; color: #888; }
            .items td { padding: 6px 0; border-bottom: 1px dashed #f0f0f0; }
            .items td.right { text-align: right; }
            .total { font-size: 18px; font-weight: 800; border-top: 2px dashed #26402e; padding-top: 10px; text-align: right; margin-bottom: 14px; color: #26402e; }
            .comment { background: #fdfbf7; border: 1px solid #ecd899; padding: 8px; border-radius: 4px; font-size: 12px; margin-bottom: 12px; }
            .footer { text-align: center; font-size: 11px; color: #777; border-top: 1px dashed #ccc; padding-top: 12px; margin-top: 16px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">PONÉ LA PAVA</div>
            <div class="subtitle">Comprobante de Pedido / Despacho</div>
          </div>
          <div class="meta">
            <div><strong>Cliente:</strong> ${order.customerName}</div>
            ${order.customerPhone ? `<div><strong>Teléfono:</strong> ${order.customerPhone}</div>` : ""}
            <div><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleString("es-AR")}</div>
            <div><strong>Estado:</strong> ${order.status.toUpperCase()}</div>
          </div>
          ${order.comment ? `<div class="comment"><strong>Observación:</strong> ${order.comment}</div>` : ""}
          <table class="items">
            <thead>
              <tr><th>Cant.</th><th>Producto</th><th class="right">Subtotal</th></tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (i) => `<tr>
                    <td style="font-weight:bold;">${i.quantity}x</td>
                    <td>${i.productName}</td>
                    <td class="right">${formatPrice(i.subtotal)}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">TOTAL: ${formatPrice(order.total)}</div>
          <div class="footer">¡Gracias por elegir Poné La Pava! 🧉</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
