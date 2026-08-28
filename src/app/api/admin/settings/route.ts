import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getSiteSettings, updateSiteSettings } from "@/lib/settings";
import { logAudit } from "@/lib/auditLog";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { handle, ValidationError } from "@/lib/api-guard";

export async function GET() {
  return handle("GET /api/admin/settings", () => getSiteSettings());
}

const REQUIRED_FIELDS = [
  "businessName",
  "whatsappNumber",
  "whatsappDisplay",
  "addressLine",
  "addressCity",
  "hoursWeekday",
  "hoursSaturday",
] as const;

// Hours drive isStoreOpenNow() on both the storefront and the cart — a typo
// here silently makes the store look closed (or open) all day, so the shape is
// checked before it can be stored.
const HOURS_PATTERN = /^\s*\d{1,2}:\d{2}\s*[–—-]\s*\d{1,2}:\d{2}\s*$/;

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  return handle("PUT /api/admin/settings", async () => {
    const input = {} as Record<string, string>;
    for (const field of REQUIRED_FIELDS) {
      const value = typeof body?.[field] === "string" ? (body[field] as string).trim() : "";
      if (!value) throw new ValidationError(`El campo "${field}" es obligatorio`);
      if (value.length > 200) {
        throw new ValidationError(`El campo "${field}" es demasiado largo`);
      }
      input[field] = value;
    }
    if (!/^\d{8,20}$/.test(input.whatsappNumber)) {
      throw new ValidationError(
        "El número de WhatsApp debe tener sólo dígitos con código de país (ej: 5492994650177)",
      );
    }
    for (const field of ["hoursWeekday", "hoursSaturday"] as const) {
      if (!HOURS_PATTERN.test(input[field])) {
        throw new ValidationError(
          `Los horarios deben tener el formato "9:00 – 19:00" (campo ${field})`,
        );
      }
    }

    const settings = await updateSiteSettings(
      input as unknown as Parameters<typeof updateSiteSettings>[0],
    );

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    await logAudit({
      actorEmail: data.user?.email ?? "desconocido",
      action: "settings_update",
      entityType: "settings",
      details: { ...input },
    });

    revalidatePath("/", "layout");
    return settings;
  });
}
