import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteProduct, getProductById, updateProduct } from "@/lib/products";
import { logAudit } from "@/lib/auditLog";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { handle, ValidationError, validateProduct } from "@/lib/api-guard";
import { deleteUnreferencedImages } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function actorEmail(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? "desconocido";
}

function revalidateProduct(id: string) {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath(`/producto/${id}`);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  return handle(`PUT /api/admin/products/${id}`, async () => {
    const input = validateProduct(body);
    const before = await getProductById(id);
    if (!before) throw new ValidationError("El producto no existe");

    const product = await updateProduct(id, input);

    // Photos dropped by this edit are no longer referenced anywhere.
    const removed = before.images.filter(
      (url) => !product.images.includes(url),
    );
    await deleteUnreferencedImages(removed);

    await logAudit({
      actorEmail: await actorEmail(),
      action: "product_update",
      entityType: "product",
      entityId: id,
      details: {
        name: product.name,
        price: { before: before.price, after: product.price },
        stock: { before: before.stock, after: product.stock },
        status: { before: before.status, after: product.status },
      },
    });

    revalidateProduct(id);
    return product;
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return handle(`DELETE /api/admin/products/${id}`, async () => {
    const before = await getProductById(id);
    if (!before) throw new ValidationError("El producto no existe");

    await deleteProduct(id);
    await deleteUnreferencedImages(before.images);

    await logAudit({
      actorEmail: await actorEmail(),
      action: "product_delete",
      entityType: "product",
      entityId: id,
      details: { name: before.name },
    });

    revalidateProduct(id);
    return { ok: true };
  });
}
