import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ValidateRow {
  id: string;
  price: number;
  stock: number;
  status: string;
}

// Public endpoint — hit from /carrito to re-check price/stock/status of
// items sitting in a localStorage cart snapshot that may be days old.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as { ids?: string[] };
  if (!body.ids?.length) {
    return NextResponse.json({ products: [] });
  }
  const { data, error } = await supabase
    .from("products")
    .select("id, price, stock, status")
    .in("id", body.ids);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ products: data as ValidateRow[] });
}
