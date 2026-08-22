import { NextResponse } from "next/server";
import { getPendingOrdersCount } from "@/lib/orders";

export async function GET() {
  const count = await getPendingOrdersCount();
  return NextResponse.json({ count });
}
