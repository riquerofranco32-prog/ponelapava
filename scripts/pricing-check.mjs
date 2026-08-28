// Self-check for the order pricing rules — the one place in the project where
// a wrong number is money. Runs the same cases the cart and /api/orders share.
//
//   node scripts/pricing-check.mjs
//
// Kept as a plain assert script (no test framework) to match the other
// zero-dependency scripts in this folder.

import assert from "node:assert/strict";

// Node >= 22.18 strips TypeScript types natively, so the shared module can be
// imported as-is — no build step, same code the app runs.
const { computeOrderTotals } = await import("../src/lib/pricing.ts");

const lines = [
  { price: 10_000, quantity: 2 },
  { price: 5_000, quantity: 1 },
]; // subtotal 25.000

// Retiro en local + transferencia: 10% off, sin envío.
assert.deepEqual(
  computeOrderTotals({
    lines,
    deliveryMethod: "pickup",
    paymentMethod: "transfer",
  }),
  {
    subtotal: 25_000,
    couponDiscount: 0,
    paymentDiscount: 2_500,
    totalDiscount: 2_500,
    shippingCost: 0,
    total: 22_500,
  },
);

// Tarjeta: sin descuento de pago. Envío por debajo del umbral: se cobra.
const card = computeOrderTotals({
  lines,
  deliveryMethod: "delivery",
  paymentMethod: "card",
});
assert.equal(card.paymentDiscount, 0);
assert.equal(card.shippingCost, 3_500);
assert.equal(card.total, 28_500);

// Sobre el umbral de envío gratis: sin costo de envío.
const bigCart = computeOrderTotals({
  lines: [{ price: 70_000, quantity: 1 }],
  deliveryMethod: "delivery",
  paymentMethod: "card",
});
assert.equal(bigCart.shippingCost, 0);
assert.equal(bigCart.total, 70_000);

// El descuento por pago se calcula DESPUÉS del cupón, no sobre el subtotal.
const withCoupon = computeOrderTotals({
  lines,
  deliveryMethod: "pickup",
  paymentMethod: "cash",
  coupon: { code: "MATE20", discountType: "percent", discountValue: 20 },
});
assert.equal(withCoupon.couponDiscount, 5_000);
assert.equal(withCoupon.paymentDiscount, 2_000); // 10% de 20.000, no de 25.000
assert.equal(withCoupon.total, 18_000);

// Un cupón fijo mayor al subtotal no puede dejar el total en negativo.
const hugeCoupon = computeOrderTotals({
  lines: [{ price: 1_000, quantity: 1 }],
  deliveryMethod: "pickup",
  paymentMethod: "card",
  coupon: { code: "REGALO", discountType: "fixed", discountValue: 99_999 },
});
assert.equal(hugeCoupon.total, 0);

console.log("pricing-check: OK");

// ── Validaciones de entrada (mismo módulo que usan las rutas /api/admin) ──
const { validateProduct, validateCategory, validateCoupon, ValidationError } =
  await import("../src/lib/validation.ts");

const validProduct = {
  name: "Mate de prueba",
  price: 1000,
  category: "mates",
  images: ["/x.png"],
  stock: 3,
  status: "available",
};

function rejects(fn, what) {
  assert.throws(fn, ValidationError, `debería rechazar: ${what}`);
}

rejects(() => validateProduct({ ...validProduct, price: -100 }), "precio negativo");
rejects(() => validateProduct({ ...validProduct, price: 0 }), "precio cero");
rejects(() => validateProduct({ ...validProduct, price: "gratis" }), "precio no numérico");
rejects(() => validateProduct({ ...validProduct, name: "   " }), "nombre vacío");
rejects(() => validateProduct({ ...validProduct, stock: -1 }), "stock negativo");
rejects(() => validateProduct({ ...validProduct, stock: 1.5 }), "stock decimal");
rejects(() => validateProduct({ ...validProduct, images: [] }), "sin fotos");
rejects(() => validateProduct({ ...validProduct, category: "" }), "sin categoría");
rejects(() => validateProduct({ ...validProduct, slug: "Mate Con Espacios" }), "slug inválido");
rejects(() => validateProduct(null), "payload vacío");

// Un status desconocido no se propaga: cae a "available".
assert.equal(validateProduct({ ...validProduct, status: "hackeado" }).status, "available");
// El slug se deriva del nombre cuando no viene.
assert.equal(validateProduct(validProduct).slug, "mate-de-prueba");

rejects(() => validateCategory({ name: "" }), "categoría sin nombre");
assert.equal(validateCategory({ name: "Yerbas Premium" }).slug, "yerbas-premium");

rejects(() => validateCoupon({ code: "AB", discountType: "percent", discountValue: 10 }), "código corto");
rejects(() => validateCoupon({ code: "VERANO", discountType: "otro", discountValue: 10 }), "tipo inválido");
rejects(() => validateCoupon({ code: "VERANO", discountType: "percent", discountValue: 150 }), "porcentaje > 100");
rejects(() => validateCoupon({ code: "VERANO", discountType: "fixed", discountValue: -5 }), "descuento negativo");
rejects(
  () =>
    validateCoupon({
      code: "VERANO",
      discountType: "fixed",
      discountValue: 500,
      validFrom: "2026-12-01",
      validUntil: "2026-01-01",
    }),
  "vigencia invertida",
);
assert.equal(validateCoupon({ code: "verano ", discountType: "fixed", discountValue: 500 }).code, "VERANO");

// ── Estados de pedido ────────────────────────────────────────────────────
const { isOrderStatus } = await import("../src/lib/orderStatus.ts");
for (const ok of ["pending", "confirmed", "delivered", "cancelled"]) {
  assert.equal(isOrderStatus(ok), true, ok);
}
for (const bad of ["entregado", "", null, undefined, 1, "DELIVERED"]) {
  assert.equal(isOrderStatus(bad), false, String(bad));
}

console.log("validation-check: OK");
