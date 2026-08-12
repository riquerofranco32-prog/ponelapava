import { WhatsAppOrderData } from "@/types";
import { formatPrice } from "./utils";

// ── Configuration ──────────────────────────────────────
// Format: country code + number without + or spaces
// Número temporal de Simón (dueño); reemplazar por WhatsApp de empresa cuando esté listo
export const WHATSAPP_NUMBER = "5492994650177";
// Misma línea, formateada para mostrar en pantalla.
export const WHATSAPP_DISPLAY = "+54 9 2994 65-0177";
export const WHATSAPP_BASE_URL = "https://wa.me";

/**
 * Generates a formatted WhatsApp message for an order.
 */
export function generateWhatsAppMessage(data: WhatsAppOrderData): string {
  const { customerName, items, total, comment } = data;

  const itemLines = items
    .map(
      ({ product, quantity }) =>
        `• ${product.name} x${quantity} — ${formatPrice(product.price * quantity)}`,
    )
    .join("\n");

  const message = [
    `Hola Poné La Pava 👋`,
    ``,
    `Quiero realizar el siguiente pedido:`,
    ``,
    itemLines,
    ``,
    `*Total: ${formatPrice(total)}*`,
    ``,
    `*Nombre:* ${customerName}`,
    comment ? `*Comentario:* ${comment}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return message;
}

/**
 * Builds a WhatsApp deep link URL with the pre-filled message.
 */
export function buildWhatsAppUrl(data: WhatsAppOrderData): string {
  const message = generateWhatsAppMessage(data);
  const encoded = encodeURIComponent(message);
  return `${WHATSAPP_BASE_URL}/${WHATSAPP_NUMBER}?text=${encoded}`;
}

/**
 * Builds a wa.me link with an optional pre-filled message.
 * Use for static hrefs (e.g. "consult about this product" links).
 */
export function whatsappChatUrl(message?: string): string {
  const encoded = message ? `?text=${encodeURIComponent(message)}` : "";
  return `${WHATSAPP_BASE_URL}/${WHATSAPP_NUMBER}${encoded}`;
}

/**
 * Opens a WhatsApp conversation in a new tab.
 */
export function openWhatsApp(data: WhatsAppOrderData): void {
  const url = buildWhatsAppUrl(data);
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Opens a simple WhatsApp chat (no pre-filled message).
 */
export function openWhatsAppChat(message?: string): void {
  const encoded = message ? encodeURIComponent(message) : "";
  const url = `${WHATSAPP_BASE_URL}/${WHATSAPP_NUMBER}${encoded ? `?text=${encoded}` : ""}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
