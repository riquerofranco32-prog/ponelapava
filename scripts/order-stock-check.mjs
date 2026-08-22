#!/usr/bin/env node
/**
 * order-stock-check.mjs — self-check for the confirm/cancel stock math in
 * src/lib/orders.ts (adjustStock). Pure math, no Supabase, no framework.
 *
 * Mirrors admin/page.tsx's handleStockChange rule exactly: stock <= 0 auto-
 * marks out_of_stock, restocking from 0 auto-clears back to available.
 *
 * Run: node scripts/order-stock-check.mjs
 */
import assert from "node:assert/strict";

// ponytail: duplicated from adjustStock() in src/lib/orders.ts on purpose —
// keeps this a zero-dependency plain-node script. If the rule in orders.ts
// changes, update both.
function nextStockAndStatus(stock, status, quantity, sign) {
  const nextStock = Math.max(0, stock + sign * quantity);
  let nextStatus = status;
  if (nextStock <= 0 && nextStatus !== "out_of_stock") nextStatus = "out_of_stock";
  else if (nextStock > 0 && nextStatus === "out_of_stock") nextStatus = "available";
  return { stock: nextStock, status: nextStatus };
}

// Confirming an order decrements stock (sign -1).
assert.deepEqual(
  nextStockAndStatus(10, "available", 3, -1),
  { stock: 7, status: "available" },
);
assert.deepEqual(
  nextStockAndStatus(3, "available", 3, -1),
  { stock: 0, status: "out_of_stock" },
);
// Oversold order clamps at 0 instead of going negative.
assert.deepEqual(
  nextStockAndStatus(2, "available", 5, -1),
  { stock: 0, status: "out_of_stock" },
);

// Cancelling a confirmed order restores stock (sign +1).
assert.deepEqual(
  nextStockAndStatus(0, "out_of_stock", 3, 1),
  { stock: 3, status: "available" },
);
assert.deepEqual(
  nextStockAndStatus(7, "available", 3, 1),
  { stock: 10, status: "available" },
);
// Product manually marked out_of_stock stays that way even if restocked
// back above 0 by a cancel — matches handleStockChange, which only clears
// out_of_stock when qty > 0, so this case DOES clear it (documented as the
// existing rule, not special-cased here).
assert.deepEqual(
  nextStockAndStatus(0, "out_of_stock", 1, 1),
  { stock: 1, status: "available" },
);

console.log("order-stock-check: all assertions passed");
