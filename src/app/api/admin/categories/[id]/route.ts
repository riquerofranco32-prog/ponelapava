import { NextRequest, NextResponse } from "next/server";
import {
  deleteCategory,
  updateCategory,
  CategoryInput,
} from "@/lib/categories";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const input = (await request.json()) as CategoryInput;
  const category = await updateCategory(id, input);
  return NextResponse.json(category);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await deleteCategory(id);
  return NextResponse.json({ ok: true });
}
