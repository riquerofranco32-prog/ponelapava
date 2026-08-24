import { NextRequest, NextResponse } from "next/server";
import {
  getSiteSettings,
  updateSiteSettings,
  SiteSettingsInput,
} from "@/lib/settings";
import { logAudit } from "@/lib/auditLog";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const input = (await request.json()) as SiteSettingsInput;
  const settings = await updateSiteSettings(input);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  await logAudit({
    actorEmail: data.user?.email ?? "desconocido",
    action: "settings_update",
    entityType: "settings",
    details: { ...input },
  });

  return NextResponse.json(settings);
}
