import { NextRequest } from "next/server";
import { getStockMovements } from "@/lib/stockMovements";
import { handle } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") || undefined;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));

  return handle("GET /api/admin/stock/movements", async () => {
    return getStockMovements(productId, limit);
  });
}
