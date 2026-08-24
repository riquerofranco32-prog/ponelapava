import { supabaseAdmin } from "@/lib/supabase";

export type AuditAction =
  | "order_status_change"
  | "product_update"
  | "product_delete"
  | "settings_update";

interface LogAuditParams {
  actorEmail: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

// Best-effort — a logging failure should never block the actual mutation,
// so errors are swallowed rather than thrown.
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await supabaseAdmin()
      .from("audit_log")
      .insert({
        actor_email: params.actorEmail,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId ?? null,
        details: params.details ?? {},
      });
  } catch {
    // ponytail: swallow — see comment above
  }
}

export interface AuditLogEntry {
  id: string;
  actorEmail: string;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

interface AuditLogRow {
  id: string;
  actor_email: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

// Postgres "undefined_table" — thrown if supabase-migration-audit-log.sql
// hasn't been run yet. The admin UI should show an empty state, not crash.
const UNDEFINED_TABLE = "42P01";

export async function getAuditLog(limit = 100): Promise<AuditLogEntry[]> {
  const { data, error } = await supabaseAdmin()
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error?.code === UNDEFINED_TABLE) return [];
  if (error) throw error;
  return (data as AuditLogRow[]).map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: row.details,
    createdAt: row.created_at,
  }));
}
