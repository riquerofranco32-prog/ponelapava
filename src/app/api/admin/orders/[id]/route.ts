import { NextRequest } from "next/server";
import { updateOrderStatus, updateOrderPaymentStatus, deleteOrder } from "@/lib/orders";
import { isOrderStatus } from "@/lib/orderStatus";
import { logAudit } from "@/lib/auditLog";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { handle, ValidationError } from "@/lib/api-guard";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    status?: unknown;
    paymentStatus?: unknown;
  } | null;

  return handle(`PATCH /api/admin/orders/${id}`, async () => {
    if (!body || (body.status === undefined && body.paymentStatus === undefined)) {
      throw new ValidationError("Debe especificar status o paymentStatus");
    }

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const actorEmail = data.user?.email ?? "desconocido";

    if (body.status !== undefined) {
      if (!isOrderStatus(body.status)) {
        throw new ValidationError("Estado de pedido inválido");
      }
      await updateOrderStatus(id, body.status);
      await logAudit({
        actorEmail,
        action: "order_status_change",
        entityType: "order",
        entityId: id,
        details: { status: body.status },
      });
    }

    if (body.paymentStatus !== undefined) {
      if (body.paymentStatus !== "unpaid" && body.paymentStatus !== "paid") {
        throw new ValidationError("Estado de cobro inválido (debe ser unpaid o paid)");
      }
      await updateOrderPaymentStatus(id, body.paymentStatus);
      await logAudit({
        actorEmail,
        action: "order_payment_status_change",
        entityType: "order",
        entityId: id,
        details: { paymentStatus: body.paymentStatus },
      });
    }

    return { ok: true };
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return handle(`DELETE /api/admin/orders/${id}`, async (adminUser) => {
    await deleteOrder(id);

    await logAudit({
      actorEmail: adminUser.email,
      action: "order_delete",
      entityType: "order",
      entityId: id,
      details: { deletedAt: new Date().toISOString() },
    });

    return { ok: true, deletedId: id };
  });
}

