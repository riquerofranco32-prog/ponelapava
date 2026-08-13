import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/orders";
import { Order } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { status } = (await request.json()) as { status: Order["status"] };
  await updateOrderStatus(id, status);
  return NextResponse.json({ ok: true });
}
