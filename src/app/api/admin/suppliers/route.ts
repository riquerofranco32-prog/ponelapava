import { NextRequest } from "next/server";
import { getSuppliers, createSupplier } from "@/lib/suppliers";
import { handle, validateSupplier } from "@/lib/api-guard";
import { logAudit } from "@/lib/auditLog";

export async function GET() {
  return handle("GET /api/admin/suppliers", async () => {
    return getSuppliers();
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  return handle("POST /api/admin/suppliers", async (adminUser) => {
    const input = validateSupplier(body);
    const supplier = await createSupplier(input);

    await logAudit({
      actorEmail: adminUser.email,
      action: "settings_update",
      entityType: "supplier",
      entityId: supplier.id,
      details: {
        name: supplier.name,
        contactName: supplier.contactName,
      },
    });

    return supplier;
  });
}
