import { NextResponse } from "next/server";
import { getLandingContent } from "@/lib/landing";

export async function GET() {
  const content = await getLandingContent();
  return NextResponse.json(content);
}
