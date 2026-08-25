import { NextRequest, NextResponse } from "next/server";
import { deleteCoupon, updateCoupon } from "@/lib/coupons";
import { CouponInput } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const input = (await request.json()) as CouponInput;
    const coupon = await updateCoupon(id, input);
    return NextResponse.json(coupon);
  } catch (error: unknown) {
    console.error("Error updating coupon:", error);
    const msg = error instanceof Error ? error.message : "Error al actualizar cupón";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteCoupon(id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Error deleting coupon:", error);
    const msg = error instanceof Error ? error.message : "Error al eliminar cupón";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
