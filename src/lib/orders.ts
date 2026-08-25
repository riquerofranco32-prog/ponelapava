import { supabase, supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem, CartItem, ProductStatus } from "@/types";
import { STORE_TIMEZONE } from "@/lib/hours";

interface OrderRow {
  id: string;
  customer_name: string;
  customer_phone?: string | null;
  items: OrderItem[];
  subtotal: number;
  total: number;
  comment: string | null;
  status: Order["status"];
  created_at: string;
}

function fromRow(row: OrderRow): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone ?? undefined,
    items: row.items,
    subtotal: row.subtotal,
    total: row.total,
    comment: row.comment ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  total: number;
  comment?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<void> {
  const orderItems: OrderItem[] = input.items.map(({ product, quantity }) => ({
    productId: product.id,
    productName: product.name,
    quantity,
    price: product.price,
    subtotal: product.price * quantity,
  }));

  const payload: Record<string, unknown> = {
    customer_name: input.customerName,
    items: orderItems,
    subtotal: input.total,
    total: input.total,
    comment: input.comment || null,
  };

  if (input.customerPhone) {
    payload.customer_phone = input.customerPhone;
  }

  const { error } = await supabase.from("orders").insert(payload);
  if (error) {
    // If customer_phone column doesn't exist yet, retry without it
    if (error.code === UNDEFINED_COLUMN && input.customerPhone) {
      delete payload.customer_phone;
      const retry = await supabase.from("orders").insert(payload);
      if (retry.error) throw retry.error;
      return;
    }
    throw error;
  }
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(fromRow);
}

// Mirrors admin/page.tsx's handleStockChange rule: 0 stock auto-marks a
// product out_of_stock, restocking from 0 auto-clears it back to available.
// sign is -1 when an order is confirmed (stock leaves), +1 when a confirmed
// order is cancelled (stock comes back).
async function adjustStock(items: OrderItem[], sign: -1 | 1): Promise<void> {
  const admin = supabaseAdmin();
  for (const item of items) {
    const { data, error: fetchError } = await admin
      .from("products")
      .select("stock, status")
      .eq("id", item.productId)
      .single();
    if (fetchError) throw fetchError;

    const stock = Math.max(0, data.stock + sign * item.quantity);
    let status = data.status as ProductStatus;
    if (stock <= 0 && status !== "out_of_stock") status = "out_of_stock";
    else if (stock > 0 && status === "out_of_stock") status = "available";

    const { error: updateError } = await admin
      .from("products")
      .update({ stock, status })
      .eq("id", item.productId);
    if (updateError) throw updateError;
  }
}

// Postgres "undefined_column" — thrown if supabase-migration-order-stock-applied.sql
// hasn't been run yet. Order status changes must keep working even then;
// they just skip stock adjustment until the migration lands.
const UNDEFINED_COLUMN = "42703";

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
): Promise<void> {
  const admin = supabaseAdmin();

  // stock_applied is an idempotency guard so a double-click on "Confirmado",
  // or a delivered->confirmed->delivered round-trip, can't decrement (or
  // restore) stock twice.
  let current: {
    status: Order["status"];
    items: OrderItem[];
    stock_applied?: boolean;
  };
  let hasStockColumn = true;
  const first = await admin
    .from("orders")
    .select("status, stock_applied, items")
    .eq("id", id)
    .single();
  if (first.error?.code === UNDEFINED_COLUMN) {
    hasStockColumn = false;
    const fallback = await admin
      .from("orders")
      .select("status, items")
      .eq("id", id)
      .single();
    if (fallback.error) throw fallback.error;
    current = fallback.data;
  } else if (first.error) {
    throw first.error;
  } else {
    current = first.data;
  }

  const currentStatus = current.status as Order["status"];
  const stockApplied = hasStockColumn
    ? (current.stock_applied as boolean)
    : false;
  const items = current.items as OrderItem[];

  const update: { status: Order["status"]; stock_applied?: boolean } = {
    status,
  };

  if (hasStockColumn) {
    if (
      status === "confirmed" &&
      currentStatus !== "confirmed" &&
      !stockApplied
    ) {
      await adjustStock(items, -1);
      update.stock_applied = true;
    } else if (
      currentStatus === "confirmed" &&
      status === "cancelled" &&
      stockApplied
    ) {
      await adjustStock(items, 1);
      update.stock_applied = false;
    }
  } else {
    console.warn(
      "orders.stock_applied column missing — run supabase-migration-order-stock-applied.sql. Skipping stock adjustment.",
    );
  }

  const { error } = await admin.from("orders").update(update).eq("id", id);
  if (error) throw error;
}

// `head: true` skips fetching row data entirely — Postgres returns just the
// count, so this badge polling every 30s doesn't drag the whole order
// history along just to check a number.
export async function getPendingOrdersCount(): Promise<number> {
  const { count, error } = await supabaseAdmin()
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}

export interface DashboardStats {
  totalRevenue: number;
  orderCount: number;
  avgTicket: number;
  revenueChange: number | null;
  orderCountChange: number | null;
  avgTicketChange: number | null;
  salesByDay: { date: string; total: number }[];
  topProducts: { name: string; quantity: number }[];
  peakHours: { hour: number; orders: number }[];
}

// Last 14 days of orders drive the dashboard's revenue KPIs and sales chart
// by default — enough to be useful for a small shop without pulling the
// whole history on every load. /admin/reportes calls the same function with
// a wider window (getDashboardStats(30|90)). Either way the prior period of
// equal length is fetched in the same query just to compute the % change.
const STATS_WINDOW_DAYS = 14;

// (recent - previous) / previous * 100, or null when previous is 0 (avoids
// Infinity/NaN when there's nothing to compare against).
function percentChange(recent: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((recent - previous) / previous) * 100;
}

export async function getDashboardStats(
  windowDays: number = STATS_WINDOW_DAYS,
): Promise<DashboardStats> {
  const since = new Date();
  since.setDate(since.getDate() - windowDays * 2);

  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("total, items, created_at")
    .gte("created_at", since.toISOString())
    .neq("status", "cancelled");
  if (error) throw error;

  const allOrders = data as Pick<OrderRow, "total" | "items" | "created_at">[];

  const boundary = new Date();
  boundary.setDate(boundary.getDate() - windowDays);
  const boundaryIso = boundary.toISOString();

  const orders = allOrders.filter((o) => o.created_at >= boundaryIso);
  const previousOrders = allOrders.filter((o) => o.created_at < boundaryIso);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;
  const avgTicket = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  const previousRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0);
  const previousOrderCount = previousOrders.length;
  const previousAvgTicket =
    previousOrderCount > 0
      ? Math.round(previousRevenue / previousOrderCount)
      : 0;

  const revenueChange = percentChange(totalRevenue, previousRevenue);
  const orderCountChange = percentChange(orderCount, previousOrderCount);
  const avgTicketChange = percentChange(avgTicket, previousAvgTicket);

  const byDay = new Map<string, number>();
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of orders) {
    const day = order.created_at.slice(0, 10);
    if (byDay.has(day)) {
      byDay.set(day, (byDay.get(day) ?? 0) + order.total);
    }
  }
  const salesByDay = Array.from(byDay.entries()).map(([date, total]) => ({
    date,
    total,
  }));

  const productQty = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      productQty.set(
        item.productName,
        (productQty.get(item.productName) ?? 0) + item.quantity,
      );
    }
  }
  const topProducts = Array.from(productQty.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Hour-of-day in store-local time (America/Argentina/Buenos_Aires), not
  // server time — Vercel functions run in UTC, which would shift every
  // bucket by 3h and make "hora pico" wrong.
  const hourOfDay = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    hour: "numeric",
    hour12: false,
  });
  const ordersByHour = new Map<number, number>();
  for (const order of orders) {
    const hour = Number(hourOfDay.format(new Date(order.created_at))) % 24;
    ordersByHour.set(hour, (ordersByHour.get(hour) ?? 0) + 1);
  }
  const peakHours = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    orders: ordersByHour.get(hour) ?? 0,
  }));

  return {
    totalRevenue,
    orderCount,
    avgTicket,
    revenueChange,
    orderCountChange,
    avgTicketChange,
    peakHours,
    salesByDay,
    topProducts,
  };
}
