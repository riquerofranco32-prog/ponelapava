import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  CreateOrderInput,
  OrderValidationError,
} from "@/lib/orders";
import { recordFailedOrder } from "@/lib/failedOrders";

// Public endpoint — hit from /carrito when a customer checks out via WhatsApp.
//
// Everything that decides money (prices, discounts, shipping, total) is
// recomputed inside createOrder from the products table; this handler only
// shapes and length-caps the free text. A payload claiming total: 1 is simply
// ignored, not trusted.
//
// El carrito abre WhatsApp ANTES de llamar acá y no puede deshacerlo, así que
// todo rechazo posterior a esa apertura es una venta que ya ocurrió y un
// registro que se pierde. Por eso cada camino de error escribe el intento en
// failed_orders (o, si esa tabla todavía no existe, en los logs del servidor)
// antes de responder.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | (Omit<Partial<CreateOrderInput>, "items"> & {
        items?: {
          productId?: string;
          product?: { id?: string };
          quantity?: number;
        }[];
      })
    | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const customerName = String(body.customerName ?? "");
  const customerPhone = body.customerPhone
    ? String(body.customerPhone).slice(0, 30).trim()
    : undefined;

  // Accepts both the cart's `{ product: { id } , quantity }` shape and a
  // plain `{ productId, quantity }`; only the id and the quantity are kept.
  const items = Array.isArray(body.items)
    ? body.items.map((item) => ({
        productId: String(item?.productId ?? item?.product?.id ?? ""),
        quantity: Number(item?.quantity),
      }))
    : [];

  if (items.length === 0 || items.length > 50) {
    await recordFailedOrder({
      customerName,
      customerPhone,
      items,
      reason: "El pedido debe contener entre 1 y 50 productos",
      stage: "payload",
    });
    return NextResponse.json(
      { error: "El pedido debe contener entre 1 y 50 productos" },
      { status: 400 },
    );
  }

  try {
    const order = await createOrder({
      customerName,
      customerPhone,
      items,
      couponCode: body.couponCode
        ? String(body.couponCode).slice(0, 30).trim().toUpperCase()
        : undefined,
      deliveryMethod: body.deliveryMethod,
      deliveryAddress: body.deliveryAddress
        ? String(body.deliveryAddress).slice(0, 300).trim()
        : undefined,
      paymentMethod: body.paymentMethod,
      comment: body.comment
        ? String(body.comment).slice(0, 500).trim()
        : undefined,
    });

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      await recordFailedOrder({
        customerName,
        customerPhone,
        items,
        reason: error.message,
        stage: "validation",
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error in POST /api/orders:", error);
    await recordFailedOrder({
      customerName,
      customerPhone,
      items,
      reason: error instanceof Error ? error.message : "Error desconocido",
      stage: "server",
    });
    return NextResponse.json(
      { error: "Error al procesar el pedido" },
      { status: 500 },
    );
  }
}
