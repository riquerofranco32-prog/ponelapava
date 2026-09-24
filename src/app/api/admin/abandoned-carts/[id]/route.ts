import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { handle, ValidationError } from "@/lib/api-guard";
import { logAudit } from "@/lib/auditLog";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  return handle(`PATCH /api/admin/abandoned-carts/${id}`, async (adminUser) => {
    if (typeof body?.recovered !== "boolean") {
      throw new ValidationError("El campo 'recovered' debe ser booleano");
    }

    const { data, error } = await supabaseAdmin()
      .from("abandoned_carts")
      .update({ recovered: body.recovered })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      actorEmail: adminUser.email,
      action: "settings_update",
      entityType: "abandoned_cart",
      entityId: id,
      details: {
        recovered: body.recovered,
      },
    });

    return data;
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return handle(`DELETE /api/admin/abandoned-carts/${id}`, async (adminUser) => {
    const { error } = await supabaseAdmin()
      .from("abandoned_carts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await logAudit({
      actorEmail: adminUser.email,
      action: "cart_delete",
      entityType: "abandoned_cart",
      entityId: id,
      details: { deletedAt: new Date().toISOString() },
    });

    return { ok: true, deletedId: id };
  });
}

