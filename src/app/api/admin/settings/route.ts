import { NextRequest, NextResponse } from "next/server";
import {
  getSiteSettings,
  updateSiteSettings,
  SiteSettingsInput,
} from "@/lib/settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const input = (await request.json()) as SiteSettingsInput;
  const settings = await updateSiteSettings(input);
  return NextResponse.json(settings);
}
