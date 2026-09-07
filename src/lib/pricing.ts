// Single source of truth for every number that ends up on an order.
//
// The checkout UI (/carrito) and the order endpoint (/api/orders) both import
// from here, so what the customer sees and what the server stores are computed
// by the same code. The server still recomputes from DB prices — these
// constants only fix the *rules*, never the inputs.

// El envío no se cotiza en el sitio: el pedido se cierra por WhatsApp y ahí se
// coordina el costo, que paga el comprador. Acá vivían un umbral de envío
// gratis sobre $65.000 y una tarifa fija de $3.500, ninguno confirmado por el
// negocio: el umbral prometía algo que el local no da, y la tarifa se sumaba
// al total que se guardaba en la tabla orders.

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
  total: number;
}

// Ni el medio de pago ni el método de entrega entran en el cálculo: los dos se
// registran, pero ninguno cambia el precio. El 10% por transferencia/efectivo
// y el envío gratis sobre $65.000 vivían acá y no eran promos del local.
export function computeOrderTotals(params: {
  lines: PricedLine[];
  coupon?: AppliedCoupon | null;
}): OrderTotals {
  const { lines, coupon } = params;

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

  const totalDiscount = couponDiscount;

  return {
    subtotal,
    couponDiscount,
    totalDiscount,
    total: Math.max(0, subtotal - totalDiscount),
  };
}
