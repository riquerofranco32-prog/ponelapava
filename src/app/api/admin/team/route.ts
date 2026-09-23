import { NextRequest } from "next/server";
import { handle, ValidationError } from "@/lib/api-guard";
import { listAdminUsers, inviteAdminUser, AdminRole } from "@/lib/adminUsers";

export async function GET() {
  return handle(
    "GET /api/admin/team",
    () => listAdminUsers(),
    { requiredRole: "owner" }
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const role = body?.role as AdminRole;

  if (!email || !email.includes("@")) {
    throw new ValidationError("Email inválido");
  }
  if (role !== "owner" && role !== "staff") {
    throw new ValidationError("Rol inválido (debe ser 'owner' o 'staff')");
  }

  return handle(
    "POST /api/admin/team",
    async (actor) => {
      const user = await inviteAdminUser(email, role, actor.email);
      return user;
    },
    { requiredRole: "owner" }
  );
}
