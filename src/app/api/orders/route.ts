import { NextRequest, NextResponse } from "next/server";
import { createOrder, CreateOrderInput } from "@/lib/orders";

// Public endpoint — hit from /carrito when a customer checks out via
// WhatsApp. Validated strictly to ensure data integrity and prevent abuse.
export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as CreateOrderInput;

    if (!input || typeof input !== "object") {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const customerName = String(input.customerName || "").trim();
    if (!customerName || customerName.length < 2 || customerName.length > 100) {
      return NextResponse.json(
        { error: "Nombre de cliente inválido (debe tener entre 2 y 100 caracteres)" },
        { status: 400 }
      );
    }

    if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 50) {
      return NextResponse.json(
        { error: "El pedido debe contener entre 1 y 50 productos" },
        { status: 400 }
      );
    }

    for (const item of input.items) {
      if (
        !item?.product?.id ||
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 100
      ) {
        return NextResponse.json(
          { error: "Detalle de productos inválido o cantidades fuera de rango" },
          { status: 400 }
        );
      }
    }

    const total = Number(input.total);
    if (isNaN(total) || total < 0 || total > 100_000_000) {
      return NextResponse.json({ error: "Monto total inválido" }, { status: 400 });
    }

    // Clean and sanitize string lengths
    const sanitizedInput: CreateOrderInput = {
      ...input,
      customerName,
      customerPhone: input.customerPhone ? String(input.customerPhone).slice(0, 30).trim() : undefined,
      deliveryAddress: input.deliveryAddress ? String(input.deliveryAddress).slice(0, 300).trim() : undefined,
      comment: input.comment ? String(input.comment).slice(0, 500).trim() : undefined,
      couponCode: input.couponCode ? String(input.couponCode).slice(0, 30).trim().toUpperCase() : undefined,
    };

    const order = await createOrder(sanitizedInput);
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/orders:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error al procesar el pedido",
      },
      { status: 500 },
    );
  }
}
