import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";

    let query = supabase
      .from("products")
      .select("id, name, slug, price, category, status, stock, images, tags, brand, weight")
      .order("id");

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,brand.ilike.%${q}%`
      );
    }

    const { data, error } = await query.limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
