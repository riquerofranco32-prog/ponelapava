// Single source of truth for every number that ends up on an order.
//
// The checkout UI (/carrito) and the order endpoint (/api/orders) both import
// from here, so what the customer sees and what the server stores are computed
// by the same code. The server still recomputes from DB prices — these
// constants only fix the *rules*, never the inputs.

export const FREE_SHIPPING_THRESHOLD = 65_000;
export const STANDARD_SHIPPING_COST = 3_500;

export type DeliveryMethod = "pickup" | "delivery";
// "card" es el valor histórico del tercer medio de pago; de cara al cliente
// se muestra como Mercado Pago. El local no cobra con tarjeta propia: si el
// comprador usa una desde su Mercado Pago, los intereses son de él.
export type PaymentMethod = "transfer" | "card" | "cash";

export interface PricedLine {
  price: number;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
}

export interface OrderTotals {
  subtotal: number;
  couponDiscount: number;
  totalDiscount: number;
  shippingCost: number;
  total: number;
}

// `paymentMethod` ya no entra en el cálculo: el medio de pago se registra,
// pero no cambia el precio. El 10% por transferencia/efectivo que vivía acá
// nunca fue una promo del local — restaba 10% al total de toda orden real,
// incluido el que se guardaba en la base.
export function computeOrderTotals(params: {
  lines: PricedLine[];
  deliveryMethod: DeliveryMethod;
  coupon?: AppliedCoupon | null;
}): OrderTotals {
  const { lines, deliveryMethod, coupon } = params;

  const subtotal = lines.reduce(
    (acc, line) => acc + line.price * line.quantity,
    0,
  );

  let couponDiscount = 0;
  if (coupon) {
    couponDiscount =
      coupon.discountType === "percent"
        ? Math.round((subtotal * coupon.discountValue) / 100)
        : Math.min(subtotal, coupon.discountValue);
  }

  const shippingCost =
    deliveryMethod === "delivery" && subtotal < FREE_SHIPPING_THRESHOLD
      ? STANDARD_SHIPPING_COST
      : 0;

  const totalDiscount = couponDiscount;

  return {
    subtotal,
    couponDiscount,
    totalDiscount,
    shippingCost,
    total: Math.max(0, subtotal - totalDiscount + shippingCost),
  };
}
