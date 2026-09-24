// Run: node --experimental-strip-types scripts/order-tags-check.mjs
import assert from "node:assert/strict";
import { parseOrderComment } from "../src/lib/orderTags.ts";
import { storeDateKey } from "../src/lib/hours.ts";

const web = parseOrderComment(
  "[Envío a Domicilio: San Martín 123] sin TACC [Pago: Transferencia] [Cupón: MATE10 (-$1500)]",
);
assert.equal(web.deliveryMethod, "delivery");
assert.equal(web.deliveryAddress, "San Martín 123");
assert.equal(web.paymentMethod, "transfer");
assert.equal(web.couponCode, "MATE10");
assert.equal(web.discount, 1500);

const pickup = parseOrderComment("[Retiro en Local - Catriel] [Pago: Efectivo en Local]");
assert.equal(pickup.deliveryMethod, "pickup");
assert.equal(pickup.paymentMethod, "cash");

const counter = parseOrderComment("[Pago: Tarjeta / Débito] [Retiro en Local Catriel]");
assert.equal(counter.paymentMethod, "card");
assert.equal(counter.deliveryMethod, "pickup");

const empty = parseOrderComment(null);
assert.equal(empty.deliveryMethod, undefined);
assert.equal(empty.paymentMethod, undefined);

// 22:30 ART on the 23rd is 01:30 UTC on the 24th — must bucket as the 23rd.
assert.equal(storeDateKey("2026-09-24T01:30:00Z"), "2026-09-23");
assert.equal(storeDateKey("2026-09-24T03:00:00Z"), "2026-09-24");

console.log("order-tags-check OK");
