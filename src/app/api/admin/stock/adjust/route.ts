import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { adjustProductStockAtomic } from "@/lib/stockMovements";
import { handle, validateStockAdjustment } from "@/lib/api-guard";
import { logAudit } from "@/lib/auditLog";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  return handle("POST /api/admin/stock/adjust", async (adminUser) => {
    const input = validateStockAdjustment(body);

    const result = await adjustProductStockAtomic({
      productId: input.productId,
      delta: input.delta,
      reason: input.reason,
      note: input.note,
      createdBy: adminUser.email,
    });

    await logAudit({
      actorEmail: adminUser.email,
      action: "product_update",
      entityType: "product",
      entityId: result.productId,
      details: {
        stock: { before: result.previousStock, after: result.newStock },
        status: { before: result.previousStatus, after: result.newStatus },
        delta: result.delta,
        reason: result.reason,
        note: input.note,
      },
    });

    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath(`/producto/${result.productId}`);

    return result;
  });
}
