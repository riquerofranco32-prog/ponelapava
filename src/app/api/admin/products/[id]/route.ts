import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, updateProduct, ProductInput } from "@/lib/products";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const input = (await request.json()) as ProductInput;
  const product = await updateProduct(id, input);
  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
