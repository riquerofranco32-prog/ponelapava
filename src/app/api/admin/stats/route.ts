import { getDashboardStats } from "@/lib/orders";
import { handle } from "@/lib/api-guard";

export async function GET() {
  return handle("GET /api/admin/stats", () => getDashboardStats());
}
