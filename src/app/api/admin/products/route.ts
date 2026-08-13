import { NextRequest, NextResponse } from "next/server";
import { createProduct, getProducts, ProductInput } from "@/lib/products";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as ProductInput;
  const product = await createProduct(input);
  return NextResponse.json(product, { status: 201 });
}
