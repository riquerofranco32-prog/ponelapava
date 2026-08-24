import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/orders";
import { logAudit } from "@/lib/auditLog";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Order } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { status } = (await request.json()) as { status: Order["status"] };
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

  return NextResponse.json({ ok: true });
}
