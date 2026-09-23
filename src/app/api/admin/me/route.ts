import { handle } from "@/lib/api-guard";

export async function GET() {
  return handle("GET /api/admin/me", async (adminUser) => {
    return {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    };
  });
}
