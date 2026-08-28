import { NextRequest, NextResponse } from "next/server";
import { createCoupon, getCoupons } from "@/lib/coupons";
import { handle, validateCoupon } from "@/lib/api-guard";


export async function GET() {
  return handle("GET /api/admin/coupons", () => getCoupons());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await handle("POST /api/admin/coupons", () =>
    createCoupon(validateCoupon(body)),
  );
  if (!result.ok) return result;
  return NextResponse.json(await result.json(), { status: 201 });
}
