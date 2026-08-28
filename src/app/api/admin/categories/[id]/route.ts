import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  countProductsInCategory,
  deleteCategory,
  getCategoryById,
  moveProductsToCategory,
  updateCategory,
} from "@/lib/categories";
import { handle, ValidationError, validateCategory } from "@/lib/api-guard";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/catalogo");
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  return handle(`PUT /api/admin/categories/${id}`, async () => {
    const input = validateCategory(body);
    const before = await getCategoryById(id);
    if (!before) throw new ValidationError("La categoría no existe");

    const category = await updateCategory(id, input);

    // Carry the products over when the slug changes — see
    // moveProductsToCategory for why this is not a DB cascade.
    await moveProductsToCategory(before.slug, category.slug);

    revalidateStorefront();
    return category;
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return handle(`DELETE /api/admin/categories/${id}`, async () => {
    const category = await getCategoryById(id);
    if (!category) throw new ValidationError("La categoría no existe");

    const productCount = await countProductsInCategory(category.slug);
    if (productCount > 0) {
      throw new ValidationError(
        `No se puede eliminar "${category.name}": tiene ${productCount} producto${
          productCount === 1 ? "" : "s"
        } asignado${productCount === 1 ? "" : "s"}. Movelos a otra categoría primero.`,
      );
    }

    await deleteCategory(id);
    revalidateStorefront();
    return { ok: true };
  });
}
