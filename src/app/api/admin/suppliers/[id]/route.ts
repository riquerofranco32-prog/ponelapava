import { NextRequest } from "next/server";
import { updateSupplier, deleteSupplier, getSupplierById } from "@/lib/suppliers";
import { handle, validateSupplier, ValidationError } from "@/lib/api-guard";
import { logAudit } from "@/lib/auditLog";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  return handle(`PUT /api/admin/suppliers/${id}`, async (adminUser) => {
    const existing = await getSupplierById(id);
    if (!existing) throw new ValidationError("Proveedor no encontrado");

    const input = validateSupplier(body);
    const updated = await updateSupplier(id, input);

    await logAudit({
      actorEmail: adminUser.email,
      action: "settings_update",
      entityType: "supplier",
      entityId: id,
      details: {
        name: updated.name,
      },
    });

    return updated;
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return handle(
    `DELETE /api/admin/suppliers/${id}`,
    async (adminUser) => {
      const existing = await getSupplierById(id);
      if (!existing) throw new ValidationError("Proveedor no encontrado");

      await deleteSupplier(id);

      await logAudit({
        actorEmail: adminUser.email,
        action: "settings_update",
        entityType: "supplier",
        entityId: id,
        details: {
          name: existing.name,
          deleted: true,
        },
      });

      return { success: true };
    },
    { requiredRole: "owner" }
  );
}
