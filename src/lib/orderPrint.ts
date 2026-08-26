import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/orderStatus";

export function printOrderRemito(order: Order) {
  const printWindow = window.open("", "_blank", "width=640,height=800");
  if (!printWindow) return;

  const dateStr = new Date(order.createdAt).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const paymentLabel =
    order.paymentMethod === "transfer"
      ? "Transferencia Bancaria (10% OFF)"
      : order.paymentMethod === "cash"
        ? "Efectivo / Contraentrega"
        : "Tarjeta de Crédito / Débito";

  const deliveryLabel =
    order.deliveryMethod === "pickup"
      ? "Retiro en Tienda (Punto de Entrega)"
      : "Envío a Domicilio / Cadetería";

  const shortId = (order.id || "NUEVO").slice(0, 8).toUpperCase();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Remito de Despacho #${shortId} - ${order.customerName}</title>
        <style>
          @page {
            margin: 8mm;
            size: auto;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111;
            background: #fff;
            padding: 16px;
            max-width: 480px;
            margin: 0 auto;
            font-size: 13px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #182b1d;
            padding-bottom: 12px;
            margin-bottom: 14px;
          }
          .brand {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 0.08em;
            color: #182b1d;
          }
          .subtitle {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #666;
            margin-top: 2px;
          }
          .order-badge {
            display: inline-block;
            margin-top: 6px;
            padding: 3px 8px;
            background: #f0ebe1;
            border-radius: 4px;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 0.04em;
          }
          .section {
            margin-bottom: 14px;
            border-bottom: 1px dashed #ddd;
            padding-bottom: 10px;
          }
          .section-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #888;
            margin-bottom: 6px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          .field {
            font-size: 12px;
          }
          .field strong {
            color: #222;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          .items-table th {
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #777;
            padding: 6px 4px;
            border-bottom: 1px solid #182b1d;
          }
          .items-table td {
            padding: 8px 4px;
            border-bottom: 1px dashed #eee;
            vertical-align: middle;
          }
          .check-box {
            width: 14px;
            height: 14px;
            border: 1.5px solid #333;
            border-radius: 3px;
            display: inline-block;
            margin-right: 6px;
            vertical-align: middle;
          }
          .right {
            text-align: right;
          }
          .total-box {
            background: #f8f6f0;
            border: 1.5px solid #182b1d;
            border-radius: 6px;
            padding: 10px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
          }
          .total-label {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .total-amount {
            font-size: 20px;
            font-weight: 900;
            color: #182b1d;
          }
          .notes {
            background: #fdfbf7;
            border: 1px solid #ecd899;
            padding: 8px 10px;
            border-radius: 6px;
            font-size: 11px;
            margin-bottom: 14px;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #666;
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px dashed #ccc;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">PONÉ LA PAVA 🧉</div>
          <div class="subtitle">Remito de Despacho & Control de Empaque</div>
          <div class="order-badge">ORDEN #${shortId} · ${STATUS_LABELS[order.status].toUpperCase()}</div>
        </div>

        <div class="section">
          <div class="section-title">Datos del Destinatario</div>
          <div class="field"><strong>Cliente:</strong> ${order.customerName}</div>
          ${order.customerPhone ? `<div class="field"><strong>Teléfono / WhatsApp:</strong> ${order.customerPhone}</div>` : ""}
          <div class="field"><strong>Fecha:</strong> ${dateStr}</div>
          <div class="field"><strong>Entrega:</strong> ${deliveryLabel}</div>
          ${order.deliveryAddress ? `<div class="field"><strong>Dirección:</strong> ${order.deliveryAddress}</div>` : ""}
          <div class="field"><strong>Pago:</strong> ${paymentLabel}</div>
        </div>

        ${order.comment ? `
          <div class="notes">
            <strong>💬 Observaciones del Cliente:</strong><br>
            ${order.comment}
          </div>
        ` : ""}

        <div class="section-title">Detalle de Productos a Empacar (Checklist)</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 24px;">✓</th>
              <th style="width: 44px;">Cant.</th>
              <th>Producto</th>
              <th class="right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
                <tr>
                  <td><span class="check-box"></span></td>
                  <td style="font-weight: 800; font-size: 14px;">${item.quantity}x</td>
                  <td>
                    <strong>${item.productName}</strong>
                  </td>
                  <td class="right" style="font-weight: 600;">${formatPrice(item.subtotal)}</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-box">
          <span class="total-label">Total a Cobrar / Abonado:</span>
          <span class="total-amount">${formatPrice(order.total)}</span>
        </div>

        <div class="footer">
          <div>Empacado y verificado por Poné La Pava</div>
          <div style="font-size: 10px; margin-top: 4px; opacity: 0.8;">ponelapava.com · Tienda Matera Argentina</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
