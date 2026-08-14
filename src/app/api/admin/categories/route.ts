import { NextRequest, NextResponse } from "next/server";
import { createCategory, getCategories, CategoryInput } from "@/lib/categories";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as CategoryInput;
  const category = await createCategory(input);
  return NextResponse.json(category, { status: 201 });
}
