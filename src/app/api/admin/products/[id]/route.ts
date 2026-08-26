import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteProduct,
  getProductById,
  updateProduct,
  ProductInput,
} from "@/lib/products";
import { logAudit } from "@/lib/auditLog";
import { createSupabaseServerClient } from "@/lib/supabase-server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const input = (await request.json()) as ProductInput;
  const before = await getProductById(id);
  const product = await updateProduct(id, input);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  await logAudit({
    actorEmail: data.user?.email ?? "desconocido",
    action: "product_update",
    entityType: "product",
    entityId: id,
    details: {
      name: product.name,
      stock: { before: before?.stock, after: product.stock },
      status: { before: before?.status, after: product.status },
    },
  });

  // Automatically update the public store instantly
  try {
    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath(`/producto/${id}`);
  } catch {
    // ignore
  }

  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const before = await getProductById(id);
  await deleteProduct(id);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  await logAudit({
    actorEmail: data.user?.email ?? "desconocido",
    action: "product_delete",
    entityType: "product",
    entityId: id,
    details: { name: before?.name ?? id },
  });

  // Automatically update the public store instantly
  try {
    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath(`/producto/${id}`);
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true });
}
