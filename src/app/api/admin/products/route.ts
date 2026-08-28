import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createProduct, getProducts } from "@/lib/products";
import { handle, validateProduct } from "@/lib/api-guard";

export async function GET() {
  return handle("GET /api/admin/products", () => getProducts());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await handle("POST /api/admin/products", async () => {
    const product = await createProduct(validateProduct(body));
    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath(`/producto/${product.id}`);
    return product;
  });
  if (!result.ok) return result;
  return NextResponse.json(await result.json(), { status: 201 });
}
