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

    // Sanitize query to prevent PostgREST filter injection / malformed syntax errors
    const sanitized = q.replace(/[,().%*"\\]/g, " ").trim();

    if (sanitized) {
      query = query.or(
        `name.ilike.%${sanitized}%,description.ilike.%${sanitized}%,category.ilike.%${sanitized}%,brand.ilike.%${sanitized}%`
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
