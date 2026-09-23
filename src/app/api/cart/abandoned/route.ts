import { NextRequest, NextResponse } from "next/server";
import { upsertAbandonedCart, getAbandonedCartById } from "@/lib/abandonedCarts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || !body.phone) {
      return NextResponse.json(
        { error: "El teléfono es requerido para registrar el carrito" },
        { status: 400 }
      );
    }

    const cart = await upsertAbandonedCart({
      id: body.id,
      phone: body.phone,
      customerName: body.customerName,
      items: Array.isArray(body.items) ? body.items : [],
      total: Number(body.total || 0),
      step: body.step || "contact",
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error("[api] POST /api/cart/abandoned error:", error);
    return NextResponse.json(
      { error: "Error al guardar carrito abandonado" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID de carrito requerido" }, { status: 400 });
    }

    const cart = await getAbandonedCartById(id);
    if (!cart) {
      return NextResponse.json({ error: "Carrito no encontrado" }, { status: 404 });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("[api] GET /api/cart/abandoned error:", error);
    return NextResponse.json(
      { error: "Error al recuperar carrito" },
      { status: 500 }
    );
  }
}
