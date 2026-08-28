// Single source of truth for every number that ends up on an order.
//
// The checkout UI (/carrito) and the order endpoint (/api/orders) both import
// from here, so what the customer sees and what the server stores are computed
// by the same code. The server still recomputes from DB prices — these
// constants only fix the *rules*, never the inputs.

export const FREE_SHIPPING_THRESHOLD = 65_000;
export const STANDARD_SHIPPING_COST = 3_500;

// Transferencia y efectivo en local pagan 10% menos.
export const PAYMENT_DISCOUNT_RATE = 0.1;
const DISCOUNTED_PAYMENT_METHODS = ["transfer", "cash"] as const;

export type DeliveryMethod = "pickup" | "delivery";
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
  paymentDiscount: number;
  totalDiscount: number;
  shippingCost: number;
  total: number;
}

export function computeOrderTotals(params: {
  lines: PricedLine[];
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  coupon?: AppliedCoupon | null;
}): OrderTotals {
  const { lines, deliveryMethod, paymentMethod, coupon } = params;

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

  const paymentDiscount = DISCOUNTED_PAYMENT_METHODS.includes(
    paymentMethod as (typeof DISCOUNTED_PAYMENT_METHODS)[number],
  )
    ? Math.round(Math.max(0, subtotal - couponDiscount) * PAYMENT_DISCOUNT_RATE)
    : 0;

  const shippingCost =
    deliveryMethod === "delivery" && subtotal < FREE_SHIPPING_THRESHOLD
      ? STANDARD_SHIPPING_COST
      : 0;

  const totalDiscount = couponDiscount + paymentDiscount;

  return {
    subtotal,
    couponDiscount,
    paymentDiscount,
    totalDiscount,
    shippingCost,
    total: Math.max(0, subtotal - totalDiscount + shippingCost),
  };
}
