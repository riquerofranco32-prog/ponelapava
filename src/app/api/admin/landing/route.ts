import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getLandingContent, updateLandingContent } from "@/lib/landing";
import { LandingContent } from "@/types/landing";
import { logAudit } from "@/lib/auditLog";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const content = await getLandingContent();
  return NextResponse.json(content);
}

export async function PUT(request: NextRequest) {
  const input = (await request.json()) as LandingContent;
  const updated = await updateLandingContent(input);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  await logAudit({
    actorEmail: data.user?.email ?? "desconocido",
    action: "settings_update",
    entityType: "settings",
    details: { section: "landing_content" },
  });

  try {
    revalidatePath("/");
  } catch {
    // ignore
  }

  return NextResponse.json(updated);
}
