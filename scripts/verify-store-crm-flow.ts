import assert from "node:assert";
import { normalizeArPhone } from "../src/lib/phone";
import { isOrderStatus, STATUS_LABELS } from "../src/lib/orderStatus";
import { generateWhatsAppMessage, buildAdminCustomerWhatsAppUrl } from "../src/lib/whatsapp";

console.log("▶ Iniciando verificación de flujo Tienda → CRM → Pedidos...");

// 1. Verificación de normalización telefónica argentina (E.164 AR)
console.log("  1. Verificando normalización telefónica...");
assert.strictEqual(normalizeArPhone("2994123456"), "+5492994123456");
assert.strictEqual(normalizeArPhone("0299 15 4123456"), "+5492994123456");
assert.strictEqual(normalizeArPhone("+54 9 299 412-3456"), "+5492994123456");
assert.strictEqual(normalizeArPhone("5492994123456"), "+5492994123456");
assert.strictEqual(normalizeArPhone("11 15 5555 4444"), "+5491155554444");
console.log("     ✓ Teléfonos normalizados a E.164 AR correctamente.");

// 2. Verificación de estados del circuito y etiquetas
console.log("  2. Verificando circuito de 6 estados de pedidos...");
const expectedStatuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
for (const s of expectedStatuses) {
  assert.strictEqual(isOrderStatus(s), true, `El estado ${s} debe ser válido`);
  assert.ok(STATUS_LABELS[s as keyof typeof STATUS_LABELS], `El estado ${s} debe tener etiqueta en español`);
}
assert.strictEqual(isOrderStatus("in_transit"), false);
assert.strictEqual(isOrderStatus("inventado"), false);
console.log("     ✓ 6 estados validados con etiquetas en español:");
expectedStatuses.forEach((s) => console.log(`       - ${s}: ${STATUS_LABELS[s as keyof typeof STATUS_LABELS]}`));

// 3. Verificación de links de WhatsApp (tienda y admin)
console.log("  3. Verificando links de WhatsApp sin descuentos falsos...");
const msg = generateWhatsAppMessage({
  customerName: "Juan Pérez",
  customerPhone: "2994123456",
  items: [
    {
      product: {
        id: "p1",
        name: "Yerba Canarias 1kg",
        price: 6500,
        slug: "yerba-canarias-1kg",
        category: "yerbas",
        images: ["/canarias.jpg"],
        description: "",
        stock: 10,
        status: "available",
      },
      quantity: 2,
    },
  ],
  total: 13000,
  paymentMethod: "transfer",
  deliveryMethod: "pickup",
});
assert.ok(msg.includes("Transferencia"), "Debe mencionar Transferencia");
assert.ok(!msg.includes("10%"), "No debe contener 10%");
assert.ok(!msg.includes("cuotas"), "No debe contener cuotas");

const adminWa = buildAdminCustomerWhatsAppUrl("0299 15 4123456", "Juan Pérez", 13000, "confirmed");
assert.ok(adminWa.includes("5492994123456"), "El número de destino debe estar normalizado");
assert.ok(decodeURIComponent(adminWa).toLowerCase().includes("confirm"), "La plantilla debe mencionar la confirmación");

console.log("     ✓ Mensajes y links de WhatsApp limpios y funcionales.");
console.log("\n✅ Todos los tests del circuito Tienda → CRM → Pedidos pasaron exitosamente.");
