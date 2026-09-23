import { supabase, supabaseAdmin } from "@/lib/supabase";
import { AbandonedCart, AbandonedCartInput, CartItem } from "@/types";
import { normalizeArPhone } from "@/lib/phone";

interface AbandonedCartRow {
  id: string;
  phone: string;
  customer_name: string | null;
  items: unknown;
  total: number;
  step: string;
  last_activity: string;
  recovered: boolean;
  created_at: string;
}

function fromRow(row: AbandonedCartRow): AbandonedCart {
  let items: CartItem[] = [];
  if (Array.isArray(row.items)) {
    items = row.items as CartItem[];
  } else if (typeof row.items === "string") {
    try {
      items = JSON.parse(row.items);
    } catch {
      items = [];
    }
  }

  return {
    id: row.id,
    phone: row.phone,
    customerName: row.customer_name ?? undefined,
    items,
    total: Number(row.total ?? 0),
    step: (row.step as "contact" | "delivery" | "payment") || "contact",
    lastActivity: row.last_activity,
    recovered: Boolean(row.recovered),
    createdAt: row.created_at,
  };
}

export async function upsertAbandonedCart(
  input: AbandonedCartInput
): Promise<AbandonedCart> {
  const admin = supabaseAdmin();
  const normalizedPhone = normalizeArPhone(input.phone);
  const now = new Date().toISOString();
  const id = input.id || crypto.randomUUID();

  const payload = {
    id,
    phone: normalizedPhone,
    customer_name: input.customerName?.trim() || null,
    items: input.items,
    total: input.total,
    step: input.step || "contact",
    last_activity: now,
    recovered: false,
  };

  const { data, error } = await admin
    .from("abandoned_carts")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    // If migration hasn't been run yet, don't crash checkout
    if (error.code === "42P01" || error.code === "PGRST204") {
      return {
        id,
        phone: normalizedPhone,
        customerName: input.customerName,
        items: input.items,
        total: input.total,
        step: input.step || "contact",
        lastActivity: now,
        recovered: false,
        createdAt: now,
      };
    }
    throw error;
  }

  return fromRow(data as AbandonedCartRow);
}

export async function getAbandonedCarts(filter?: {
  recovered?: boolean;
  timeFilter?: "all" | "1h" | "24h";
}): Promise<AbandonedCart[]> {
  let query = supabase
    .from("abandoned_carts")
    .select("*")
    .order("last_activity", { ascending: false });

  if (filter?.recovered !== undefined) {
    query = query.eq("recovered", filter.recovered);
  }

  if (filter?.timeFilter === "1h") {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    query = query.lte("last_activity", oneHourAgo);
  } else if (filter?.timeFilter === "24h") {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    query = query.lte("last_activity", oneDayAgo);
  }

  const { data, error } = await query;
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST204") {
      return [];
    }
    throw error;
  }

  return (data as AbandonedCartRow[]).map(fromRow);
}

export async function getAbandonedCartById(
  id: string
): Promise<AbandonedCart | null> {
  const { data, error } = await supabase
    .from("abandoned_carts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return fromRow(data as AbandonedCartRow);
}

export async function markCartRecovered(identifier: {
  id?: string;
  phone?: string;
}): Promise<void> {
  const admin = supabaseAdmin();
  let query = admin.from("abandoned_carts").update({ recovered: true });

  if (identifier.id) {
    query = query.eq("id", identifier.id);
  } else if (identifier.phone) {
    const normalized = normalizeArPhone(identifier.phone);
    query = query.eq("phone", normalized);
  } else {
    return;
  }

  const { error } = await query;
  if (error && error.code !== "42P01") {
    console.error("[abandoned-carts] Error marking cart as recovered:", error);
  }
}

export function buildRecoveryWhatsAppMessage({
  customerName,
  recoveryUrl,
}: {
  customerName?: string;
  recoveryUrl: string;
}): string {
  const name = customerName ? customerName.trim() : "cómo estás";
  return `Hola ${name}! Vimos que te quedó pendiente tu pedido en Poné La Pava 🧉 ¿Tuviste algún problema o te podemos ayudar con algo? Te dejamos el link para retomarlo cuando quieras: ${recoveryUrl}`;
}
