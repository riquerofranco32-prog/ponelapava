import { WhatsAppOrderData } from "@/types";
import { formatPrice } from "./utils";

// ── Configuration ──────────────────────────────────────
// Replace with the real WhatsApp number when available
// Format: country code + number without + or spaces
// Example: "5491112345678" for +54 9 11 1234-5678
export const WHATSAPP_NUMBER = "5491100000000"; // ← PLACEHOLDER: replace with real number
export const WHATSAPP_BASE_URL = "https://wa.me";

/**
 * Generates a formatted WhatsApp message for an order.
 */
export function generateWhatsAppMessage(data: WhatsAppOrderData): string {
  const { customerName, items, total, comment } = data;

  const itemLines = items
    .map(
      ({ product, quantity }) =>
        `• ${product.name} x${quantity} — ${formatPrice(product.price * quantity)}`
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
