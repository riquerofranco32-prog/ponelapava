import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Código de cupón requerido" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const { data, error } = await supabase
      .from("coupons")
      .select("id, code, discount_type, discount_value, valid_from, valid_until, active")
      .eq("code", cleanCode)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { valid: false, error: "El cupón no existe o está inactivo" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (data.valid_from && new Date(data.valid_from) > now) {
      return NextResponse.json(
        { valid: false, error: "Este cupón todavía no está vigente" },
        { status: 400 }
      );
    }

    if (data.valid_until && new Date(data.valid_until) < now) {
      return NextResponse.json(
        { valid: false, error: "Este cupón ya ha expirado" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: data.code,
        discountType: data.discount_type,
        discountValue: data.discount_value,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { valid: false, error: err instanceof Error ? err.message : "Error al validar" },
      { status: 500 }
    );
  }
}
