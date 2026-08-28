import { getPendingOrdersCount } from "@/lib/orders";
import { handle } from "@/lib/api-guard";

export async function GET() {
  return handle("GET /api/admin/orders/pending-count", async () => ({
    count: await getPendingOrdersCount(),
  }));
}
