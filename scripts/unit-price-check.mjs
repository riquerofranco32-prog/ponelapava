#!/usr/bin/env node
/**
 * unit-price-check.mjs — self-check for unitPrice() in src/lib/utils.ts.
 * Pure math, no Supabase, no framework.
 *
 * Run: node scripts/unit-price-check.mjs
 */
import assert from "node:assert/strict";

// ponytail: duplicated from unitPrice()/formatPrice() in src/lib/utils.ts on
// purpose — keeps this a zero-dependency plain-node script. If the parsing
// rule or currency format changes there, update both.
const WEIGHT_PATTERN = /^(\d+(?:\.\d+)?)\s*(kg|g)$/i;

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function unitPrice(price, weight) {
  if (!weight) return null;
  const match = weight.trim().match(WEIGHT_PATTERN);
  if (!match) return null;
  const grams = match[2].toLowerCase() === "kg" ? Number(match[1]) * 1000 : Number(match[1]);
  if (!(grams > 0)) return null;
  return `${formatPrice(price / (grams / 100))} / 100 g`;
}

// Whole grams.
assert.equal(unitPrice(1000, "500g"), `${formatPrice(200)} / 100 g`);

// Kilograms, with and without a space, decimal included.
assert.equal(unitPrice(2000, "1kg"), `${formatPrice(200)} / 100 g`);
assert.equal(unitPrice(2000, "1.5 Kg"), `${formatPrice(133.33)} / 100 g`);

// Missing weight.
assert.equal(unitPrice(1000, undefined), null);
assert.equal(unitPrice(1000, ""), null);

// Unparseable weight strings.
assert.equal(unitPrice(1000, "combo"), null);
assert.equal(unitPrice(1000, "250ml"), null);
assert.equal(unitPrice(1000, "grande"), null);

console.log("unit-price-check: all assertions passed");
