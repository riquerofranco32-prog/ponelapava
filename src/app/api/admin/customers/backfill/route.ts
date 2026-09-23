import { backfillCustomers } from "@/lib/customers";
import { handle } from "@/lib/api-guard";

export async function POST() {
  return handle("POST /api/admin/customers/backfill", () =>
    backfillCustomers(),
  );
}
