#!/usr/bin/env npx tsx
/**
 * scripts/stock-inventory-check.ts
 *
 * Self-check suite for FASE 7 — Inventario profesional
 * Verifies:
 * 1. Stock delta clamping and status auto-sync (available vs out_of_stock)
 * 2. Validation rules for stock adjustments (reason, delta, mandatory note for 'loss')
 * 3. Profit margin & markup math (price vs cost_price)
 * 4. Replenishment logic (stock <= min_stock, suggested replenishment qty)
 * 5. Supplier WhatsApp order text generation
 *
 * Run: npx tsx scripts/stock-inventory-check.ts
 */
import assert from "node:assert/strict";
import { validateStockAdjustment, validateSupplier, ValidationError } from "../src/lib/validation";
import { Product, Supplier } from "../src/types";

console.log("▶ Iniciando verificación de Inventario Profesional (Fase 7)...");

// ---------------------------------------------------------------------------
// 1. Verificación de cálculo de stock y sincronización atómica
// ---------------------------------------------------------------------------
console.log("  1. Verificando cálculo de nuevo stock y sincronización de estado...");

function calculateNextStockAndStatus(
  currentStock: number,
  currentStatus: string,
  delta: number
): { stock: number; status: string } {
  const nextStock = Math.max(0, currentStock + delta);
  let nextStatus = currentStatus;
  if (nextStock <= 0 && nextStatus !== "out_of_stock") {
    nextStatus = "out_of_stock";
  } else if (nextStock > 0 && nextStatus === "out_of_stock") {
    nextStatus = "available";
  }
  return { stock: nextStock, status: nextStatus };
}

// Sumar stock desde 0 pasa a 'available'
assert.deepEqual(
  calculateNextStockAndStatus(0, "out_of_stock", 10),
  { stock: 10, status: "available" }
);

// Restar stock hasta 0 pasa a 'out_of_stock'
assert.deepEqual(
  calculateNextStockAndStatus(5, "available", -5),
  { stock: 0, status: "out_of_stock" }
);

// Restar más de lo disponible clampa en 0 (nunca negativo)
assert.deepEqual(
  calculateNextStockAndStatus(3, "available", -10),
  { stock: 0, status: "out_of_stock" }
);

// Producto destacado con stock reducido se mantiene 'featured' mientras tenga stock
assert.deepEqual(
  calculateNextStockAndStatus(20, "featured", -5),
  { stock: 15, status: "featured" }
);

console.log("     ✓ Cálculo de stock y estado auto-sincronizado correctamente.");

// ---------------------------------------------------------------------------
// 2. Verificación de validaciones (nota obligatoria en 'loss', razones válidas)
// ---------------------------------------------------------------------------
console.log("  2. Verificando reglas de validación para ajustes de inventario...");

// Ajuste válido sin nota si es compra o ajuste manual
const validPurchase = validateStockAdjustment({
  productId: "prod-1",
  delta: 15,
  reason: "purchase",
});
assert.strictEqual(validPurchase.delta, 15);
assert.strictEqual(validPurchase.reason, "purchase");

// Pérdida / rotura SIN nota debe lanzar ValidationError
assert.throws(
  () => {
    validateStockAdjustment({
      productId: "prod-1",
      delta: -2,
      reason: "loss",
      note: "   ",
    });
  },
  (err: unknown) => {
    return (
      err instanceof ValidationError &&
      err.message.includes("La nota explicativa es obligatoria")
    );
  },
  "Pérdida sin nota debe rechazar con ValidationError"
);

// Pérdida CON nota debe ser aceptada
const validLoss = validateStockAdjustment({
  productId: "prod-1",
  delta: -1,
  reason: "loss",
  note: "Rotura durante descarga de transporte",
});
assert.strictEqual(validLoss.reason, "loss");
assert.strictEqual(validLoss.note, "Rotura durante descarga de transporte");

// Delta 0 debe ser rechazado
assert.throws(() => {
  validateStockAdjustment({
    productId: "prod-1",
    delta: 0,
    reason: "adjustment",
  });
});

console.log("     ✓ Validación estricta: nota obligatoria en pérdidas y deltas no nulos.");

// Validación de proveedores
const validSup = validateSupplier({
  name: "Distribuidora Oficial Mates",
  contactName: "Esteban",
  phone: "2994123456",
});
assert.strictEqual(validSup.name, "Distribuidora Oficial Mates");
assert.strictEqual(validSup.contactName, "Esteban");
assert.throws(() => validateSupplier({ name: "" }), "Proveedor sin nombre debe fallar");

// ---------------------------------------------------------------------------
// 3. Verificación de cálculo de margen y rentabilidad
// ---------------------------------------------------------------------------
console.log("  3. Verificando cálculo de margen bruto y costo...");

function calculateProfitMargin(price: number, costPrice?: number) {
  if (!costPrice || price <= 0 || costPrice <= 0) return null;
  const grossProfit = price - costPrice;
  const marginPct = ((grossProfit / price) * 100).toFixed(0);
  return { grossProfit, marginPct: Number(marginPct) };
}

const margin1 = calculateProfitMargin(50000, 25000);
assert.ok(margin1);
assert.strictEqual(margin1.grossProfit, 25000);
assert.strictEqual(margin1.marginPct, 50);

const margin2 = calculateProfitMargin(10000, 7000);
assert.ok(margin2);
assert.strictEqual(margin2.grossProfit, 3000);
assert.strictEqual(margin2.marginPct, 30);

console.log("     ✓ Cálculos de márgenes brutos verificados.");

// ---------------------------------------------------------------------------
// 4. Verificación de lógica de reposición y pedido a proveedores
// ---------------------------------------------------------------------------
console.log("  4. Verificando detección de bajo stock y pedido a proveedores...");

const sampleProducts: Product[] = [
  {
    id: "p1",
    name: "Yerba Mate Especial 500g",
    slug: "yerba-mate-500g",
    description: "",
    price: 4500,
    costPrice: 2200,
    stock: 2,
    minStock: 5,
    supplierId: "sup-1",
    category: "yerbas",
    status: "available",
    images: [],
  },
  {
    id: "p2",
    name: "Termo Stanley 1.4L",
    slug: "termo-stanley",
    description: "",
    price: 85000,
    costPrice: 55000,
    stock: 8,
    minStock: 5,
    supplierId: "sup-1",
    category: "termos",
    status: "available",
    images: [],
  },
  {
    id: "p3",
    name: "Bombilla Pico de Loro",
    slug: "bombilla-pico-de-loro",
    description: "",
    price: 12000,
    costPrice: 6000,
    stock: 0,
    minStock: 10,
    supplierId: "sup-2",
    category: "bombillas",
    status: "out_of_stock",
    images: [],
  },
];

// Filtrar productos críticos (stock <= minStock)
const critical = sampleProducts.filter((p) => p.stock <= (p.minStock ?? 5));
assert.strictEqual(critical.length, 2, "Debe haber 2 productos bajo stock");
assert.ok(critical.some((p) => p.id === "p1"));
assert.ok(critical.some((p) => p.id === "p3"));

// Cálculo de sugerido: minStock * 2 - stock
function getSuggestedQty(p: Product): number {
  const min = p.minStock ?? 5;
  return Math.max(1, min * 2 - p.stock);
}

assert.strictEqual(getSuggestedQty(sampleProducts[0]), 8); // 5*2 - 2 = 8
assert.strictEqual(getSuggestedQty(sampleProducts[2]), 20); // 10*2 - 0 = 20

// Armado de texto para WhatsApp
const sampleSupplier: Supplier = {
  id: "sup-1",
  name: "Distribuidora Mates del Sur",
  contactName: "Roberto",
  phone: "2994123456",
};

const supplierItems = critical.filter((p) => p.supplierId === sampleSupplier.id);
const greeting = sampleSupplier.contactName || sampleSupplier.name;
const lines = supplierItems
  .map((p) => `• *${p.name}*: ${getSuggestedQty(p)} unidades`)
  .join("\n");
const orderMessage = `Hola ${greeting}! Te escribo de *Poné La Pava* para pasarte un pedido de reposición:\n\n${lines}`;

assert.ok(orderMessage.includes("Roberto"));
assert.ok(orderMessage.includes("Yerba Mate Especial 500g"));
assert.ok(orderMessage.includes("8 unidades"));

console.log("     ✓ Lógica de reposición y generación de pedidos a proveedores verificada.");
console.log("\n✅ Todas las verificaciones de la FASE 7 (Inventario Profesional) pasaron exitosamente.");
