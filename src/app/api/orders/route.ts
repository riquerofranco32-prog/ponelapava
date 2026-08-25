import { NextRequest, NextResponse } from "next/server";
import { createOrder, CreateOrderInput } from "@/lib/orders";

// Public endpoint — hit from /carrito when a customer checks out via
// WhatsApp. Not behind admin auth: anyone placing a real order needs it.
export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as CreateOrderInput;
    if (!input.customerName || !input.items?.length) {
      return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
    }
    const order = await createOrder(input);
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
