import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 3) {
      return NextResponse.json(
        { error: "Ingresá un número de pedido o teléfono válido (mínimo 3 caracteres)" },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();
    
    // Clean numeric phone query if applicable
    const isPhone = /^[0-9+\s-]{6,}$/.test(q);
    const cleanedDigits = q.replace(/\D/g, "");

    let queryBuilder = admin.from("orders").select("id, customer_name, customer_phone, items, subtotal, total, comment, status, created_at");

    if (isPhone && cleanedDigits.length >= 6) {
      queryBuilder = queryBuilder.ilike("customer_phone", `%${cleanedDigits}%`);
    } else {
      // UUID search or partial ID
      queryBuilder = queryBuilder.ilike("id", `%${q.replace("#", "")}%`);
    }

    const { data, error } = await queryBuilder.order("created_at", { ascending: false }).limit(5);

    if (error) {
      console.error("Error querying tracking orders:", error);
      return NextResponse.json({ error: "Error al consultar el pedido" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // Sanitize results for public viewing (hide full phone, mask sensitive data)
    const sanitizedOrders: Order[] = data.map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone
        ? `${row.customer_phone.slice(0, 3)}***${row.customer_phone.slice(-3)}`
        : undefined,
      items: row.items as OrderItem[],
      subtotal: row.subtotal,
      total: row.total,
      comment: row.comment,
      status: row.status,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ orders: sanitizedOrders });
  } catch (err) {
    console.error("Tracking API error:", err);
    return NextResponse.json({ error: "Error de servidor al buscar pedido" }, { status: 500 });
  }
}
