import { supabaseAdmin } from "@/lib/supabase";
import { normalizeArPhone, formatPhoneDisplay } from "@/lib/phone";
import { logAudit } from "@/lib/auditLog";

export interface Customer {
  id: string;
  phoneNormalized: string;
  name: string;
  email?: string | null;
  notes?: string | null;
  tags: string[];
  followUpAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CustomerSegment = "all" | "today" | "vip" | "recurring" | "risk" | "new";

export interface CustomerWithStats extends Customer {
  displayPhone: string;
  ordersCount: number;
  totalSpent: number;
  averageTicket: number;
  lastOrderDate: string | null;
  daysSinceLastOrder: number | null;
  segment: "vip" | "recurring" | "risk" | "new";
  isFollowUpOverdue: boolean;
  isTodayActionable: boolean;
}

export interface CustomerDetailOrder {
  id: string;
  total: number;
  subtotal: number;
  status: string;
  paymentStatus?: string | null;
  createdAt: string;
  comment?: string | null;
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
}

export interface CustomerDetail extends CustomerWithStats {
  orders: CustomerDetailOrder[];
  favoriteProducts: { name: string; quantity: number }[];
}

export interface CustomersKpis {
  totalCustomers: number;
  vipCount: number;
  recurringCount: number;
  riskCount: number;
  newCount: number;
  todayPendingCount: number;
  totalRevenue: number;
}

export interface CustomersListResult {
  customers: CustomerWithStats[];
  total: number;
  kpis: CustomersKpis;
}

interface CustomerRow {
  id: string;
  phone_normalized: string;
  name: string;
  email: string | null;
  notes: string | null;
  tags: string[] | null;
  follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

const MISSING_TABLE_CODES = ["42P01", "PGRST205"];

function fromRow(row: CustomerRow): Customer {
  return {
    id: row.id,
    phoneNormalized: row.phone_normalized,
    name: row.name,
    email: row.email,
    notes: row.notes,
    tags: Array.isArray(row.tags) ? row.tags : [],
    followUpAt: row.follow_up_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Upsert de cliente al crear un pedido en la tienda o admin.
 * Normaliza el teléfono a E.164 AR y devuelve el customer_id.
 */
export async function upsertCustomerForOrder(
  name: string,
  rawPhone?: string | null,
  email?: string | null,
): Promise<string | null> {
  const normalizedPhone = normalizeArPhone(rawPhone);
  if (!normalizedPhone) return null;

  const admin = supabaseAdmin();
  const cleanName = name.trim() || "Cliente";

  try {
    // 1. Buscar si ya existe por phone_normalized
    const { data: existing, error: findError } = await admin
      .from("customers")
      .select("id, name, email")
      .eq("phone_normalized", normalizedPhone)
      .maybeSingle();

    if (findError) {
      if (MISSING_TABLE_CODES.includes(findError.code)) return null;
      throw findError;
    }

    if (existing) {
      // Actualizar nombre o email si vino más completo
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (cleanName && cleanName !== "Cliente" && existing.name === "Cliente") {
        updates.name = cleanName;
      }
      if (email && !existing.email) {
        updates.email = email.trim();
      }

      await admin.from("customers").update(updates).eq("id", existing.id);
      return existing.id;
    }

    // 2. Insertar nuevo cliente
    const { data: inserted, error: insertError } = await admin
      .from("customers")
      .insert({
        phone_normalized: normalizedPhone,
        name: cleanName,
        email: email?.trim() || null,
        tags: ["Nuevo"],
      })
      .select("id")
      .single();

    if (insertError) {
      if (MISSING_TABLE_CODES.includes(insertError.code)) return null;
      throw insertError;
    }

    return inserted.id;
  } catch (err) {
    console.error("[CRM] Error al hacer upsert de cliente:", err);
    return null;
  }
}

/**
 * Consulta server-side de clientes con cálculo de métricas, segmentación y KPIs.
 */
export async function getCustomersList(params: {
  search?: string;
  segment?: string;
  riskDays?: number;
}): Promise<CustomersListResult> {
  const admin = supabaseAdmin();
  const riskDays = Number(params.riskDays) || 45;
  const now = Date.now();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // 1. Intentar traer desde la tabla `customers`
  let customers: Customer[] = [];
  try {
    const { data, error } = await admin
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (!MISSING_TABLE_CODES.includes(error.code)) throw error;
    } else if (data) {
      customers = data.map(fromRow);
    }
  } catch {
    // Si la tabla no existe aún, se inicializará vacío
  }

  // 2. Traer todos los pedidos para vincular métricas
  const { data: ordersData, error: ordersError } = await admin
    .from("orders")
    .select("id, customer_id, customer_name, customer_phone, total, status, created_at, items")
    .order("created_at", { ascending: false });

  if (ordersError) throw ordersError;
  const allOrders = ordersData || [];

  // Mapeo de pedidos por customer_id y por teléfono normalizado
  const ordersByCustomerId = new Map<string, typeof allOrders>();
  const ordersByPhone = new Map<string, typeof allOrders>();

  for (const o of allOrders) {
    if (o.customer_id) {
      const list = ordersByCustomerId.get(o.customer_id) || [];
      list.push(o);
      ordersByCustomerId.set(o.customer_id, list);
    }
    const phoneNorm = normalizeArPhone(o.customer_phone);
    if (phoneNorm) {
      const list = ordersByPhone.get(phoneNorm) || [];
      list.push(o);
      ordersByPhone.set(phoneNorm, list);
    }
  }

  // Si no había clientes en la tabla (ej. primer arranque antes de backfill),
  // armar clientes virtuales a partir de pedidos
  if (customers.length === 0 && allOrders.length > 0) {
    const syntheticMap = new Map<string, Customer>();
    for (const o of allOrders) {
      const phoneNorm = normalizeArPhone(o.customer_phone) || `sin-tel-${o.customer_name.trim().toLowerCase()}`;
      if (!syntheticMap.has(phoneNorm)) {
        syntheticMap.set(phoneNorm, {
          id: `syn-${phoneNorm}`,
          phoneNormalized: phoneNorm.startsWith("+") ? phoneNorm : "",
          name: o.customer_name || "Cliente",
          email: null,
          notes: null,
          tags: [],
          followUpAt: null,
          createdAt: o.created_at,
          updatedAt: o.created_at,
        });
      }
    }
    customers = Array.from(syntheticMap.values());
  }

  // 3. Computar estadísticas de cada cliente
  const customersWithStats: CustomerWithStats[] = customers.map((c) => {
    // Asociar pedidos por customer_id o por teléfono
    const cOrders =
      ordersByCustomerId.get(c.id) ||
      (c.phoneNormalized ? ordersByPhone.get(c.phoneNormalized) : undefined) ||
      [];

    const ordersCount = cOrders.length;
    const totalSpent = cOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const averageTicket = ordersCount > 0 ? Math.round(totalSpent / ordersCount) : 0;

    let lastOrderDate: string | null = null;
    let daysSinceLastOrder: number | null = null;

    if (cOrders.length > 0 && cOrders[0].created_at) {
      const dateStr = cOrders[0].created_at;
      lastOrderDate = dateStr;
      const orderTime = new Date(dateStr).getTime();
      daysSinceLastOrder = Math.max(0, Math.floor((now - orderTime) / MS_PER_DAY));
    }

    // Segmentación
    let segment: "vip" | "recurring" | "risk" | "new" = "new";
    if (daysSinceLastOrder !== null && daysSinceLastOrder >= riskDays) {
      segment = "risk";
    } else if (ordersCount >= 3 || totalSpent >= 100000) {
      segment = "vip";
    } else if (ordersCount >= 2) {
      segment = "recurring";
    } else {
      segment = "new";
    }

    const isFollowUpOverdue = !!(c.followUpAt && new Date(c.followUpAt).getTime() <= now);
    const isTodayActionable = isFollowUpOverdue || segment === "risk";

    return {
      ...c,
      displayPhone: formatPhoneDisplay(c.phoneNormalized),
      ordersCount,
      totalSpent,
      averageTicket,
      lastOrderDate,
      daysSinceLastOrder,
      segment,
      isFollowUpOverdue,
      isTodayActionable,
    };
  });

  // 4. Calcular KPIs globales en el servidor
  const kpis: CustomersKpis = {
    totalCustomers: customersWithStats.length,
    vipCount: customersWithStats.filter((c) => c.segment === "vip").length,
    recurringCount: customersWithStats.filter((c) => c.segment === "recurring").length,
    riskCount: customersWithStats.filter((c) => c.segment === "risk").length,
    newCount: customersWithStats.filter((c) => c.segment === "new").length,
    todayPendingCount: customersWithStats.filter((c) => c.isTodayActionable).length,
    totalRevenue: customersWithStats.reduce((acc, c) => acc + c.totalSpent, 0),
  };

  // 5. Filtrar según parámetros solicitados
  let filtered = customersWithStats;

  // Filtro por segmento / vista "Hoy"
  const requestedSegment = (params.segment || "all").toLowerCase();
  if (requestedSegment === "today") {
    filtered = filtered.filter((c) => c.isTodayActionable);
  } else if (["vip", "recurring", "risk", "new"].includes(requestedSegment)) {
    filtered = filtered.filter((c) => c.segment === requestedSegment);
  }

  // Filtro por búsqueda de texto
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phoneNormalized.includes(q) || c.displayPhone.includes(q);
      const matchTags = c.tags.some((t) => t.toLowerCase().includes(q));
      const matchNotes = (c.notes || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchTags || matchNotes;
    });
  }

  // Ordenar: en vista "Hoy", seguimientos vencidos primero; en general, por fecha de última compra o creación
  filtered.sort((a, b) => {
    if (requestedSegment === "today") {
      if (a.isFollowUpOverdue && !b.isFollowUpOverdue) return -1;
      if (!a.isFollowUpOverdue && b.isFollowUpOverdue) return 1;
      return (b.daysSinceLastOrder || 0) - (a.daysSinceLastOrder || 0);
    }
    const dateA = a.lastOrderDate || a.createdAt;
    const dateB = b.lastOrderDate || b.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return {
    customers: filtered,
    total: filtered.length,
    kpis,
  };
}

interface RawOrderRecord {
  id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  total?: number | null;
  subtotal?: number | null;
  status: string;
  payment_status?: string | null;
  created_at: string;
  comment?: string | null;
  items?: Array<{
    productId?: string;
    productName?: string;
    name?: string;
    quantity?: number;
    price?: number;
    subtotal?: number;
  }> | null;
}

/**
 * Detalle completo de un cliente con su historial de pedidos y productos favoritos.
 */
export async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  const admin = supabaseAdmin();
  const now = Date.now();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  let customer: Customer | null = null;
  try {
    const { data, error } = await admin
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error && !MISSING_TABLE_CODES.includes(error.code)) throw error;
    if (data) customer = fromRow(data);
  } catch {
    // Si la tabla no existe
  }

  // Si no se encontró por UUID o es sintético, buscar en pedidos
  let cOrders: RawOrderRecord[] = [];
  if (customer) {
    const { data: ordersById } = await admin
      .from("orders")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (ordersById && ordersById.length > 0) {
      cOrders = ordersById;
    } else if (customer.phoneNormalized) {
      // Fallback por teléfono
      const { data: ordersByPhone } = await admin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      cOrders = (ordersByPhone || []).filter(
        (o) => normalizeArPhone(o.customer_phone) === customer!.phoneNormalized,
      );
    }
  } else {
    // Buscar pedido de cliente sintético
    const { data: allOrders } = await admin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    cOrders = (allOrders || []).filter((o) => {
      const p = normalizeArPhone(o.customer_phone) || `sin-tel-${o.customer_name.trim().toLowerCase()}`;
      return `syn-${p}` === id || o.id === id;
    });

    if (cOrders.length > 0) {
      const first = cOrders[0];
      const p = normalizeArPhone(first.customer_phone);
      customer = {
        id,
        phoneNormalized: p || "",
        name: first.customer_name || "Cliente",
        email: null,
        notes: null,
        tags: [],
        followUpAt: null,
        createdAt: first.created_at,
        updatedAt: first.created_at,
      };
    }
  }

  if (!customer) return null;

  const ordersCount = cOrders.length;
  const totalSpent = cOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const averageTicket = ordersCount > 0 ? Math.round(totalSpent / ordersCount) : 0;

  let lastOrderDate: string | null = null;
  let daysSinceLastOrder: number | null = null;
  if (cOrders.length > 0 && cOrders[0].created_at) {
    const dateStr = cOrders[0].created_at;
    lastOrderDate = dateStr;
    const orderTime = new Date(dateStr).getTime();
    daysSinceLastOrder = Math.max(0, Math.floor((now - orderTime) / MS_PER_DAY));
  }

  let segment: "vip" | "recurring" | "risk" | "new" = "new";
  if (daysSinceLastOrder !== null && daysSinceLastOrder >= 45) {
    segment = "risk";
  } else if (ordersCount >= 3 || totalSpent >= 100000) {
    segment = "vip";
  } else if (ordersCount >= 2) {
    segment = "recurring";
  } else {
    segment = "new";
  }

  const isFollowUpOverdue = !!(customer.followUpAt && new Date(customer.followUpAt).getTime() <= now);
  const isTodayActionable = isFollowUpOverdue || segment === "risk";

  // Calcular productos favoritos
  const productCountMap = new Map<string, number>();
  for (const o of cOrders) {
    const items = Array.isArray(o.items) ? o.items : [];
    for (const it of items) {
      const name = it.productName || it.name || "Producto";
      const q = Number(it.quantity) || 1;
      productCountMap.set(name, (productCountMap.get(name) || 0) + q);
    }
  }

  const favoriteProducts = Array.from(productCountMap.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const formattedOrders: CustomerDetailOrder[] = cOrders.map((o) => ({
    id: o.id,
    total: Number(o.total) || 0,
    subtotal: Number(o.subtotal) || Number(o.total) || 0,
    status: o.status,
    paymentStatus: o.payment_status,
    createdAt: o.created_at,
    comment: o.comment,
    items: (Array.isArray(o.items) ? o.items : []).map((it) => ({
      productId: it.productId,
      productName: it.productName || it.name || "Producto",
      quantity: Number(it.quantity) || 1,
      price: Number(it.price) || 0,
      subtotal: Number(it.subtotal) || (Number(it.price) || 0) * (Number(it.quantity) || 1),
    })),
  }));

  return {
    ...customer,
    displayPhone: formatPhoneDisplay(customer.phoneNormalized),
    ordersCount,
    totalSpent,
    averageTicket,
    lastOrderDate,
    daysSinceLastOrder,
    segment,
    isFollowUpOverdue,
    isTodayActionable,
    orders: formattedOrders,
    favoriteProducts,
  };
}

/**
 * Modifica notas, etiquetas o próximo seguimiento con registro en audit_log.
 */
export async function updateCustomer(
  id: string,
  updates: {
    notes?: string | null;
    tags?: string[];
    follow_up_at?: string | null;
  },
  actorEmail: string,
): Promise<Customer> {
  const admin = supabaseAdmin();

  // Validar y sanear
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if ("notes" in updates) {
    payload.notes = updates.notes ? updates.notes.trim() : null;
  }
  if ("tags" in updates && Array.isArray(updates.tags)) {
    payload.tags = Array.from(new Set(updates.tags.map((t) => t.trim()).filter(Boolean)));
  }
  if ("follow_up_at" in updates) {
    payload.follow_up_at = updates.follow_up_at ? new Date(updates.follow_up_at).toISOString() : null;
  }

  const { data, error } = await admin
    .from("customers")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  const updated = fromRow(data as CustomerRow);

  // Registrar auditoría por cada modificación
  if ("notes" in updates) {
    await logAudit({
      actorEmail,
      action: "customer_notes_update",
      entityType: "customer",
      entityId: id,
      details: { notesPreview: updates.notes?.slice(0, 100) },
    });
  }
  if ("tags" in updates) {
    await logAudit({
      actorEmail,
      action: "customer_tags_update",
      entityType: "customer",
      entityId: id,
      details: { tags: updates.tags },
    });
  }
  if ("follow_up_at" in updates) {
    await logAudit({
      actorEmail,
      action: "customer_follow_up_update",
      entityType: "customer",
      entityId: id,
      details: { followUpAt: updates.follow_up_at },
    });
  }

  return updated;
}

/**
 * Backfill de clientes a partir de pedidos existentes.
 * Agrupa pedidos por teléfono normalizado, hace upsert en `customers` y vincula `customer_id`.
 */
export async function backfillCustomers(): Promise<{
  totalOrders: number;
  mergedCustomers: number;
  linkedOrders: number;
  errors: number;
}> {
  const admin = supabaseAdmin();

  // 1. Obtener todos los pedidos
  const { data: orders, error } = await admin
    .from("orders")
    .select("id, customer_name, customer_phone, customer_id, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  const allOrders = orders || [];

  // Agrupar por teléfono normalizado
  const groups = new Map<string, { name: string; orderIds: string[]; firstCreatedAt: string }>();

  for (const o of allOrders) {
    const norm = normalizeArPhone(o.customer_phone);
    if (!norm) continue;

    const existing = groups.get(norm);
    if (existing) {
      existing.orderIds.push(o.id);
      if (existing.name === "Cliente" && o.customer_name && o.customer_name !== "Cliente") {
        existing.name = o.customer_name.trim();
      }
    } else {
      groups.set(norm, {
        name: o.customer_name?.trim() || "Cliente",
        orderIds: [o.id],
        firstCreatedAt: o.created_at,
      });
    }
  }

  let mergedCustomers = 0;
  let linkedOrders = 0;
  let errors = 0;

  for (const [phoneNorm, info] of groups.entries()) {
    try {
      // 1. Upsert customer
      let customerId: string | null = null;
      const { data: existingCust } = await admin
        .from("customers")
        .select("id")
        .eq("phone_normalized", phoneNorm)
        .maybeSingle();

      if (existingCust) {
        customerId = existingCust.id;
      } else {
        const { data: newCust, error: insErr } = await admin
          .from("customers")
          .insert({
            phone_normalized: phoneNorm,
            name: info.name,
            tags: info.orderIds.length > 1 ? ["Recurrente"] : ["Nuevo"],
            created_at: info.firstCreatedAt,
          })
          .select("id")
          .single();

        if (insErr) {
          errors++;
          continue;
        }
        customerId = newCust.id;
        mergedCustomers++;
      }

      if (customerId) {
        // 2. Link orders
        const { error: updErr } = await admin
          .from("orders")
          .update({ customer_id: customerId })
          .in("id", info.orderIds);

        if (!updErr) {
          linkedOrders += info.orderIds.length;
        } else {
          errors++;
        }
      }
    } catch {
      errors++;
    }
  }

  return {
    totalOrders: allOrders.length,
    mergedCustomers,
    linkedOrders,
    errors,
  };
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("customers")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

