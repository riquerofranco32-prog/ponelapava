import { NextRequest } from "next/server";
import { deleteCoupon, updateCoupon } from "@/lib/coupons";
import { handle, validateCoupon } from "@/lib/api-guard";


interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  return handle(`PUT /api/admin/coupons/${id}`, () =>
    updateCoupon(id, validateCoupon(body)),
  );
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handle(`DELETE /api/admin/coupons/${id}`, async () => {
    await deleteCoupon(id);
    return { ok: true };
  });
}
