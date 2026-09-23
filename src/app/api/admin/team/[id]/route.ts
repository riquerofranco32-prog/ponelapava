import { NextRequest } from "next/server";
import { handle, ValidationError } from "@/lib/api-guard";
import { updateAdminUserRole, toggleAdminUserActive, AdminRole } from "@/lib/adminUsers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  return handle(
    `PATCH /api/admin/team/${id}`,
    async (actor) => {
      let result;
      if (body?.role !== undefined) {
        const role = body.role as AdminRole;
        if (role !== "owner" && role !== "staff") {
          throw new ValidationError("Rol inválido");
        }
        result = await updateAdminUserRole(id, role, actor.email);
      }

      if (body?.active !== undefined) {
        const active = Boolean(body.active);
        result = await toggleAdminUserActive(id, active, actor.email);
      }

      if (!result) {
        throw new ValidationError("No se enviaron campos válidos para actualizar");
      }

      return result;
    },
    { requiredRole: "owner" }
  );
}
