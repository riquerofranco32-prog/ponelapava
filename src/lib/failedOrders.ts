import { supabaseAdmin } from "@/lib/supabase";

// Dónde murió el intento. Sirve para separar el ruido (payloads malformados,
// que casi siempre son bots) de lo que de verdad importa: un carrito real que
// el servidor rechazó después de que el cliente ya mandó su WhatsApp.
export type FailedOrderStage = "payload" | "validation" | "server";

export interface FailedOrderInput {
  customerName?: string | null;
  customerPhone?: string | null;
  items?: unknown;
  reason: string;
  stage: FailedOrderStage;
}

export interface FailedOrder {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  items: { productId?: string; quantity?: number }[];
  reason: string;
  stage: FailedOrderStage;
  createdAt: string;
}

interface FailedOrderRow {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: { productId?: string; quantity?: number }[];
  reason: string;
  stage: FailedOrderStage;
  created_at: string;
}

// Tabla ausente — "42P01" viene de Postgres y "PGRST205" de PostgREST cuando no
// la encuentra en su cache de esquema. Mismo criterio que auditLog: hasta que
// se corra supabase-migration-failed-orders.sql el admin muestra vacío en vez
// de romperse.
const MISSING_TABLE_CODES = ["42P01", "PGRST205"];

// El puente aprobado: si la tabla todavía no existe (o Supabase no responde),
// el intento igual queda en los logs del servidor, en una sola línea y con los
// datos necesarios para rearmar el pedido a mano.
function logToServer(entry: FailedOrderInput, cause: string): void {
  console.error(
    "[failed_orders] pedido no registrado:",
    JSON.stringify({
      stage: entry.stage,
      reason: entry.reason,
      customerName: entry.customerName ?? null,
      customerPhone: entry.customerPhone ?? null,
      items: entry.items ?? [],
      cause,
    }),
  );
}

// Best-effort y a prueba de todo: esto corre en el camino de error de un pedido
// que el cliente ya cerró por WhatsApp. Nunca lanza, nunca cambia la respuesta
// que ve el navegador.
export async function recordFailedOrder(
  entry: FailedOrderInput,
): Promise<void> {
  try {
    const { error } = await supabaseAdmin()
      .from("failed_orders")
      .insert({
        customer_name: entry.customerName?.slice(0, 100) ?? null,
        customer_phone: entry.customerPhone?.slice(0, 30) ?? null,
        items: entry.items ?? [],
        reason: entry.reason.slice(0, 500),
        stage: entry.stage,
      });
    if (!error) return;
    logToServer(
      entry,
      MISSING_TABLE_CODES.includes(error.code ?? "")
        ? "tabla failed_orders inexistente — correr supabase-migration-failed-orders.sql"
        : `insert falló: ${error.message}`,
    );
  } catch (err) {
    logToServer(entry, err instanceof Error ? err.message : String(err));
  }
}

export async function getFailedOrders(limit = 50): Promise<FailedOrder[]> {
  const { data, error } = await supabaseAdmin()
    .from("failed_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error && MISSING_TABLE_CODES.includes(error.code)) return [];
  if (error) throw error;
  return (data as FailedOrderRow[]).map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    items: Array.isArray(row.items) ? row.items : [],
    reason: row.reason,
    stage: row.stage,
    createdAt: row.created_at,
  }));
}
