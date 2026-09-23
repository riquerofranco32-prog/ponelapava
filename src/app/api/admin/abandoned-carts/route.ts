import { NextRequest } from "next/server";
import { getAbandonedCarts } from "@/lib/abandonedCarts";
import { handle } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recoveredParam = searchParams.get("recovered");
  const timeFilter = searchParams.get("timeFilter") as "all" | "1h" | "24h" | null;

  return handle("GET /api/admin/abandoned-carts", async () => {
    const recovered =
      recoveredParam === "true" ? true : recoveredParam === "false" ? false : undefined;

    const carts = await getAbandonedCarts({
      recovered,
      timeFilter: timeFilter || undefined,
    });

    // Also get all carts to compute high-level conversion metrics
    const allCarts = await getAbandonedCarts();
    const totalCount = allCarts.length;
    const recoveredCount = allCarts.filter((c) => c.recovered).length;
    const pendingCarts = allCarts.filter((c) => !c.recovered);
    const recoverableAmount = pendingCarts.reduce((acc, c) => acc + c.total, 0);
    const recoveredAmount = allCarts
      .filter((c) => c.recovered)
      .reduce((acc, c) => acc + c.total, 0);
    const recoveryRate =
      totalCount > 0 ? ((recoveredCount / totalCount) * 100).toFixed(1) : "0";

    return {
      carts,
      metrics: {
        totalCount,
        pendingCount: pendingCarts.length,
        recoveredCount,
        recoverableAmount,
        recoveredAmount,
        recoveryRate: Number(recoveryRate),
      },
    };
  });
}
