import type { DeliveryMethod, PaymentMethod } from "./pricing";

// Delivery/payment/coupon only live as "[...]" tags inside `comment` (see
// buildComment / createAdminOrder). One parser so the ticket, the detail view
// and the stats all read them the same way.
// ponytail: tags in free text; move to real columns if the format ever needs to change.
export function parseOrderComment(comment?: string | null): {
  deliveryMethod?: DeliveryMethod;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
  couponCode?: string;
  discount?: number;
} {
  const c = comment ?? "";
  const address = c.match(/\[Envío a Domicilio: ([^\]]+)\]/)?.[1]?.trim();
  const deliveryMethod: DeliveryMethod | undefined = c.includes("[Retiro en Local")
    ? "pickup"
    : address || c.includes("[Envío a Domicilio")
      ? "delivery"
      : undefined;
  const pago = c.match(/\[Pago: ([^\]]+)\]/)?.[1] ?? "";
  const paymentMethod: PaymentMethod | undefined = pago.startsWith("Transferencia")
    ? "transfer"
    : pago.startsWith("Efectivo")
      ? "cash"
      : pago
        ? "card"
        : undefined;
  const coupon = c.match(/\[Cupón: (\S+) \(-\$(\d+(?:\.\d+)?)\)\]/);
  return {
    deliveryMethod,
    deliveryAddress: address,
    paymentMethod,
    couponCode: coupon?.[1],
    discount: coupon ? Number(coupon[2]) : undefined,
  };
}
