import { NextRequest } from "next/server";
import { getOrders } from "@/lib/orders";
import { handle } from "@/lib/api-guard";
import { Order } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") as Order["status"] | "all") || undefined;
  const paymentStatus = (searchParams.get("paymentStatus") as "unpaid" | "paid" | "all") || undefined;
  const search = searchParams.get("search") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const page = searchParams.has("page") ? parseInt(searchParams.get("page")!, 10) : undefined;
  const limit = searchParams.has("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

  return handle("GET /api/admin/orders", () =>
    getOrders({
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      page,
      limit,
    }),
  );
}
