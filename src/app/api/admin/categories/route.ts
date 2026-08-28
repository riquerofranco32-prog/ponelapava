import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createCategory, getCategories } from "@/lib/categories";
import { handle, validateCategory } from "@/lib/api-guard";

export async function GET() {
  return handle("GET /api/admin/categories", () => getCategories());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await handle("POST /api/admin/categories", async () => {
    const category = await createCategory(validateCategory(body));
    revalidatePath("/");
    revalidatePath("/catalogo");
    return category;
  });
  if (!result.ok) return result;
  return NextResponse.json(await result.json(), { status: 201 });
}
