import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLandingContent, updateLandingContent } from "@/lib/landing";
import { LandingContent } from "@/types/landing";
import { logAudit } from "@/lib/auditLog";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { handle, ValidationError } from "@/lib/api-guard";

export async function GET() {
  return handle("GET /api/admin/landing", () => getLandingContent());
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);

  return handle("PUT /api/admin/landing", async () => {
    if (!body || typeof body !== "object") {
      throw new ValidationError("Contenido de landing inválido");
    }
    const updated = await updateLandingContent(body as LandingContent);

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    await logAudit({
      actorEmail: data.user?.email ?? "desconocido",
      action: "settings_update",
      entityType: "settings",
      details: { section: "landing_content" },
    });

    revalidatePath("/");
    return updated;
  });
}
