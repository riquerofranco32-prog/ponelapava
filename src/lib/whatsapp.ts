import { WhatsAppOrderData } from "@/types";
import { formatPrice } from "./utils";
import { normalizeArPhone } from "./phone";

export const WHATSAPP_BASE_URL = "https://wa.me";

/**
 * Generates a formatted WhatsApp message for an order.
 */
export function generateWhatsAppMessage(data: WhatsAppOrderData): string {
  const {
    customerName,
    customerPhone,
    items,
    subtotal,
    discount,
    couponCode,
    deliveryMethod,
    deliveryAddress,
    total,
    comment,
  } = data;

  const itemLines = items
    .map(
      ({ product, quantity }) =>
        `• ${product.name} x${quantity} — ${formatPrice(product.price * quantity)}`,
    )
    .join("\n");

  const message = [
    `Hola Poné La Pava 👋🧉`,
    ``,
    `Quiero realizar el siguiente pedido:`,
    ``,
    itemLines,
    ``,
    couponCode && discount
      ? `*Cupón ${couponCode}:* -${formatPrice(discount)}`
      : null,
    data.paymentMethod === "transfer"
      ? `*Pago:* 🏦 Transferencia Bancaria`
      : data.paymentMethod === "cash"
        ? `*Pago:* 💵 Efectivo en el Local`
        : data.paymentMethod === "card"
          ? `*Pago:* 💳 Mercado Pago`
          : null,
    deliveryMethod === "pickup"
      ? `*Entrega:* 🏪 Retiro en Local (Catriel)`
      : deliveryMethod === "delivery"
        ? `*Entrega:* 🛵 Envío a Domicilio (costo a coordinar)`
        : null,
    deliveryAddress ? `*Dirección:* ${deliveryAddress}` : null,
    ``,
    `*TOTAL: ${formatPrice(total)}*`,
    ``,
    `*Cliente:* ${customerName}`,
    customerPhone ? `*Teléfono:* ${customerPhone}` : null,
    comment ? `*Nota/Comentario:* ${comment}` : null,
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

/**
 * Builds a WhatsApp deep link to message a customer from the Admin panel.
 */
export function buildAdminCustomerWhatsAppUrl(
  phone: string,
  customerName: string,
  total: number,
  status: "pending" | "confirmed" | "delivered" | "cancelled" | "ready" | "general" = "general",
): string {
  const normalized = normalizeArPhone(phone);
  const cleanPhone = normalized ? normalized.replace(/^\+/, "") : phone.replace(/\D/g, "");

  let text = "";
  if (status === "confirmed") {
    text = `¡Hola ${customerName}! 👋 Confirmamos tu pedido en *Poné La Pava* por ${formatPrice(total)}. ¡Ya lo estamos preparando con mucho cuidado! 🧉✨`;
  } else if (status === "delivered") {
    text = `¡Hola ${customerName}! 🧉 Tu pedido de *Poné La Pava* ya fue entregado / despachado. ¡Esperamos que disfrutes cada mate! Si tenés fotos, ¡etiquétanos en Instagram! 📸`;
  } else if (status === "ready") {
    text = `¡Hola ${customerName}! 🧉 Tu pedido de *Poné La Pava* ya está listo para retirar en nuestro local. ¡Te esperamos! ✨`;
  } else {
    text = `¡Hola ${customerName}! 👋 Te escribimos desde *Poné La Pava* por tu pedido reciente. ¿Tenés unos minutos para coordinar? 🧉`;
  }

  return `${WHATSAPP_BASE_URL}/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

