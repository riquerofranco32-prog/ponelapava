import { NextRequest } from "next/server";
import { getDashboardStats } from "@/lib/orders";
import { handle } from "@/lib/api-guard";

const ALLOWED_WINDOWS = [7, 30, 90];

export async function GET(request: NextRequest) {
  const daysParam = Number(request.nextUrl.searchParams.get("days"));
  const days = ALLOWED_WINDOWS.includes(daysParam) ? daysParam : 30;
  return handle("GET /api/admin/reports", () => getDashboardStats(days));
}
