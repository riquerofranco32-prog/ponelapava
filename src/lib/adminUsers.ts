import { supabaseAdmin } from "@/lib/supabase";
import { logAudit } from "@/lib/auditLog";

export type AdminRole = "owner" | "staff";

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
}

interface AdminUserRow {
  id: string;
  email: string;
  role: AdminRole;
  active: boolean;
  created_at: string;
}

export function mapAdminUserRow(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const normalized = email.toLowerCase().trim();
  const { data, error } = await supabaseAdmin()
    .from("admin_users")
    .select("id, email, role, active, created_at")
    .eq("email", normalized)
    .maybeSingle();

  if (error || !data) return null;
  return mapAdminUserRow(data as AdminUserRow);
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabaseAdmin()
    .from("admin_users")
    .select("id, email, role, active, created_at")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as AdminUserRow[]).map(mapAdminUserRow);
}

export async function inviteAdminUser(
  email: string,
  role: AdminRole,
  actorEmail: string
): Promise<AdminUser> {
  const normalized = email.toLowerCase().trim();
  if (!normalized || !normalized.includes("@")) {
    throw new Error("El email no es válido");
  }

  const { data, error } = await supabaseAdmin()
    .from("admin_users")
    .insert({
      email: normalized,
      role,
      active: true,
    })
    .select("id, email, role, active, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe un usuario con ese email");
    }
    throw new Error(error.message);
  }

  const user = mapAdminUserRow(data as AdminUserRow);
  await logAudit({
    actorEmail,
    action: "team_member_invite",
    entityType: "admin_user",
    entityId: user.id,
    details: { email: user.email, role: user.role },
  });

  return user;
}

export async function updateAdminUserRole(
  id: string,
  role: AdminRole,
  actorEmail: string
): Promise<AdminUser> {
  // Prevent removing the last active owner
  if (role === "staff") {
    const users = await listAdminUsers();
    const activeOwners = users.filter((u) => u.role === "owner" && u.active);
    if (activeOwners.length <= 1 && activeOwners.some((u) => u.id === id)) {
      throw new Error("No podés quitar el rol al único dueño activo");
    }
  }

  const { data, error } = await supabaseAdmin()
    .from("admin_users")
    .update({ role })
    .eq("id", id)
    .select("id, email, role, active, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Usuario no encontrado");
  }

  const user = mapAdminUserRow(data as AdminUserRow);
  await logAudit({
    actorEmail,
    action: "team_member_role_change",
    entityType: "admin_user",
    entityId: user.id,
    details: { email: user.email, newRole: role },
  });

  return user;
}

export async function toggleAdminUserActive(
  id: string,
  active: boolean,
  actorEmail: string
): Promise<AdminUser> {
  // Prevent deactivating the last active owner
  if (!active) {
    const users = await listAdminUsers();
    const activeOwners = users.filter((u) => u.role === "owner" && u.active);
    if (activeOwners.length <= 1 && activeOwners.some((u) => u.id === id)) {
      throw new Error("No podés desactivar al único dueño activo");
    }
  }

  const { data, error } = await supabaseAdmin()
    .from("admin_users")
    .update({ active })
    .eq("id", id)
    .select("id, email, role, active, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Usuario no encontrado");
  }

  const user = mapAdminUserRow(data as AdminUserRow);
  await logAudit({
    actorEmail,
    action: "team_member_toggle_active",
    entityType: "admin_user",
    entityId: user.id,
    details: { email: user.email, active },
  });

  return user;
}
