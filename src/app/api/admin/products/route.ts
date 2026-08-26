import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createProduct, getProducts, ProductInput } from "@/lib/products";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as ProductInput;
  const product = await createProduct(input);

  // Automatically update the public store instantly
  try {
    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath(`/producto/${product.id}`);
  } catch {
    // ignore
  }

  return NextResponse.json(product, { status: 201 });
}
