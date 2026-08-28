import { getAuditLog } from "@/lib/auditLog";
import { handle } from "@/lib/api-guard";

export async function GET() {
  return handle("GET /api/admin/audit-log", () => getAuditLog());
}
