import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createCategory, getCategories, CategoryInput } from "@/lib/categories";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as CategoryInput;
  const category = await createCategory(input);

  try {
    revalidatePath("/");
    revalidatePath("/catalogo");
  } catch {
    // ignore
  }

  return NextResponse.json(category, { status: 201 });
}
