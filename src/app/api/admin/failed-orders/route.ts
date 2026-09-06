import { getFailedOrders } from "@/lib/failedOrders";
import { handle } from "@/lib/api-guard";

export async function GET() {
  return handle("GET /api/admin/failed-orders", () => getFailedOrders());
}
