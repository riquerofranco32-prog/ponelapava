import { NextRequest } from "next/server";
import { getOrders, deleteOrdersBulk, createAdminOrder, CreateAdminOrderInput } from "@/lib/orders";
import { handle, ValidationError } from "@/lib/api-guard";
import { logAudit } from "@/lib/auditLog";
import { Order } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") as Order["status"] | "all") || undefined;
  const paymentStatus = (searchParams.get("paymentStatus") as "unpaid" | "paid" | "all") || undefined;
  const search = searchParams.get("search") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const page = searchParams.has("page") ? parseInt(searchParams.get("page")!, 10) : undefined;
  const limit = searchParams.has("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

  return handle("GET /api/admin/orders", () =>
    getOrders({
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      page,
      limit,
    }),
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CreateAdminOrderInput | null;

  return handle("POST /api/admin/orders", async (adminUser) => {
    if (!body || typeof body !== "object") {
      throw new ValidationError("Payload inválido");
    }

    const order = await createAdminOrder(body);

    await logAudit({
      actorEmail: adminUser.email,
      action: "order_create_manual",
      entityType: "order",
      entityId: order.id,
      details: {
        customerName: order.customerName,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    });

    return order;
  });
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { ids?: string[] } | null;

  return handle("DELETE /api/admin/orders (bulk)", async (adminUser) => {
    const ids = body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError("Debe enviar un array 'ids' con los identificadores a eliminar");
    }
    if (ids.length > 200 || !ids.every((id) => typeof id === "string")) {
      throw new ValidationError("Máximo 200 pedidos por eliminación");
    }

    const deletedCount = await deleteOrdersBulk(ids);

    await logAudit({
      actorEmail: adminUser.email,
      action: "order_bulk_delete",
      entityType: "order",
      details: { count: deletedCount, ids },
    });

    return { ok: true, deletedCount };
  }, { requiredRole: "owner" });
}

