import { NextRequest, NextResponse } from "next/server";
import { createOrder, CreateOrderInput } from "@/lib/orders";

// Public endpoint — hit from /carrito when a customer checks out via
// WhatsApp. Not behind admin auth: anyone placing a real order needs it.
export async function POST(request: NextRequest) {
  const input = (await request.json()) as CreateOrderInput;
  if (!input.customerName || !input.items?.length) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }
  await createOrder(input);
  return NextResponse.json({ ok: true }, { status: 201 });
}
