import { NextRequest } from "next/server";
import { getCustomerDetail, updateCustomer, deleteCustomer } from "@/lib/customers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { handle, ValidationError } from "@/lib/api-guard";
import { logAudit } from "@/lib/auditLog";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handle(`GET /api/admin/customers/${id}`, async () => {
    const customer = await getCustomerDetail(id);
    if (!customer) {
      throw new ValidationError("Cliente no encontrado");
    }
    return customer;
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    notes?: string | null;
    tags?: string[];
    follow_up_at?: string | null;
  } | null;

  return handle(`PATCH /api/admin/customers/${id}`, async () => {
    if (!body || typeof body !== "object") {
      throw new ValidationError("Cuerpo de solicitud inválido");
    }

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const actorEmail = data.user?.email ?? "admin";

    const updated = await updateCustomer(id, body, actorEmail);
    return updated;
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return handle(`DELETE /api/admin/customers/${id}`, async (adminUser) => {
    await deleteCustomer(id);

    await logAudit({
      actorEmail: adminUser.email,
      action: "customer_delete",
      entityType: "customer",
      entityId: id,
      details: { deletedAt: new Date().toISOString() },
    });

    return { ok: true, deletedId: id };
  });
}

