import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/orders";

const ALLOWED_WINDOWS = [7, 30, 90];

export async function GET(request: NextRequest) {
  const daysParam = Number(request.nextUrl.searchParams.get("days"));
  const days = ALLOWED_WINDOWS.includes(daysParam) ? daysParam : 30;
  const stats = await getDashboardStats(days);
  return NextResponse.json(stats);
}
