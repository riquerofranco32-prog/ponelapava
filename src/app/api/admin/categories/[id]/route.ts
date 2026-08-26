import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

  try {
    revalidatePath("/");
    revalidatePath("/catalogo");
  } catch {
    // ignore
  }

  return NextResponse.json(category);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await deleteCategory(id);

  try {
    revalidatePath("/");
    revalidatePath("/catalogo");
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true });
}
