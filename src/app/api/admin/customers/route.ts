import { NextRequest } from "next/server";
import { getCustomersList } from "@/lib/customers";
import { handle } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const segment = searchParams.get("segment") || undefined;
  const riskDays = searchParams.get("riskDays") ? Number(searchParams.get("riskDays")) : undefined;

  return handle("GET /api/admin/customers", () =>
    getCustomersList({ search, segment, riskDays }),
  );
}
