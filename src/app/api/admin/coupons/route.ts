import { NextRequest, NextResponse } from "next/server";
import { createCoupon, getCoupons } from "@/lib/coupons";
import { CouponInput } from "@/types";

export async function GET() {
  try {
    const coupons = await getCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los cupones" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as CouponInput;
    if (!input.code || !input.discountValue) {
      return NextResponse.json(
        { error: "Código y valor de descuento son obligatorios" },
        { status: 400 },
      );
    }
    const coupon = await createCoupon(input);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating coupon:", error);
    const msg = error instanceof Error ? error.message : "Error al crear cupón";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
