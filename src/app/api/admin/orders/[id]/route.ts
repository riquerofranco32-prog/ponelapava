import { NextRequest } from "next/server";
import { updateOrderStatus } from "@/lib/orders";
import { isOrderStatus } from "@/lib/orderStatus";
import { logAudit } from "@/lib/auditLog";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { handle, ValidationError } from "@/lib/api-guard";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;

  return handle(`PATCH /api/admin/orders/${id}`, async () => {
    // Whitelisted here, not just in the <select> — an arbitrary string would
    // otherwise land in orders.status and break every status filter and count.
    if (!isOrderStatus(body?.status)) {
      throw new ValidationError("Estado de pedido inválido");
    }
    const status = body.status;
    await updateOrderStatus(id, status);

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    await logAudit({
      actorEmail: data.user?.email ?? "desconocido",
      action: "order_status_change",
      entityType: "order",
      entityId: id,
      details: { status },
    });

    return { ok: true };
  });
}
