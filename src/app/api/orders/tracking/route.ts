import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem } from "@/types";

// Public endpoint, so the lookup key has to be something only the customer
// knows. Two changes from the first version, both about not handing strangers
// other people's orders:
//
//  · the order id is matched exactly, not with `ilike %q%` — a 3-character
//    query used to match a slice of every id in the table (and `ilike` on a
//    uuid column errors outright);
//  · the phone needs at least 8 digits and matches on the ending, so a couple
//    of digits can't sweep the customer list.
const MIN_PHONE_DIGITS = 8;

// The stored comment carries the delivery address and any internal note. The
// status page only needs to know *how* it ships, never the street.
function redactComment(comment: string | null): string | undefined {
  if (!comment) return undefined;
  return comment.replace(
    /\[Envío a Domicilio:[^\]]*\]/g,
    "[Envío a Domicilio]",
  );
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const digits = q.replace(/\D/g, "");
    const looksLikePhone = /^[0-9+\s()-]+$/.test(q) && digits.length > 0;

    if (looksLikePhone && digits.length < MIN_PHONE_DIGITS) {
      return NextResponse.json(
        {
          error: `Ingresá el teléfono completo (al menos ${MIN_PHONE_DIGITS} dígitos)`,
        },
        { status: 400 },
      );
    }
    if (!looksLikePhone && q.length < 8) {
      return NextResponse.json(
        { error: "Ingresá el número de pedido completo o tu teléfono" },
        { status: 400 },
      );
    }

    const admin = supabaseAdmin();
    let query = admin
      .from("orders")
      .select(
        "id, customer_name, items, subtotal, total, comment, status, created_at",
      );

    query = looksLikePhone
      ? query.ilike("customer_phone", `%${digits}`)
      : query.eq("id", q.replace("#", ""));

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error querying tracking orders:", error);
      return NextResponse.json(
        { error: "Error al consultar el pedido" },
        { status: 500 },
      );
    }

    const orders: Order[] = (data ?? []).map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      items: row.items as OrderItem[],
      subtotal: row.subtotal,
      total: row.total,
      comment: redactComment(row.comment),
      status: row.status,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Tracking API error:", err);
    return NextResponse.json(
      { error: "Error de servidor al buscar pedido" },
      { status: 500 },
    );
  }
}
