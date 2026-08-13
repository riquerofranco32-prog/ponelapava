import { WhatsAppOrderData } from "@/types";
import { formatPrice } from "./utils";

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
 * Builds a WhatsApp deep link URL with the pre-filled order message.
 */
export function buildWhatsAppUrl(
  whatsappNumber: string,
  data: WhatsAppOrderData,
): string {
  const message = generateWhatsAppMessage(data);
  const encoded = encodeURIComponent(message);
  return `${WHATSAPP_BASE_URL}/${whatsappNumber}?text=${encoded}`;
}

/**
 * Builds a wa.me link with an optional pre-filled message.
 * Use for static hrefs (e.g. "consult about this product" links).
 */
export function whatsappChatUrl(
  whatsappNumber: string,
  message?: string,
): string {
  const encoded = message ? `?text=${encodeURIComponent(message)}` : "";
  return `${WHATSAPP_BASE_URL}/${whatsappNumber}${encoded}`;
}
