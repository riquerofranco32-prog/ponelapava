import { supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem, ProductStatus } from "@/types";
import { STORE_TIMEZONE } from "@/lib/hours";
import { isOrderStatus } from "@/lib/orderStatus";
import { checkCoupon } from "@/lib/coupons";
import {
  computeOrderTotals,
  DeliveryMethod,
  OrderTotals,
  PaymentMethod,
} from "@/lib/pricing";

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

// Only the fields the customer actually gets to choose. Prices, discounts and
// totals are NOT part of the input — they're recomputed from the DB in
// createOrder, so a tampered payload can't buy a mate for $1.
export interface CreateOrderInput {
  customerName: string;
  customerPhone?: string;
  items: { productId: string; quantity: number }[];
  couponCode?: string;
  deliveryMethod?: DeliveryMethod;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
  comment?: string;
}

export class OrderValidationError extends Error {}

const MAX_QUANTITY_PER_ITEM = 100;

// Builds the order's lines from the products table — the request only says
// *which* product and *how many*; name, price and subtotal come from the DB.
async function priceItems(
  requested: { productId: string; quantity: number }[],
): Promise<OrderItem[]> {
  const ids = [...new Set(requested.map((i) => i.productId))];
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("id, name, price, stock, status")
    .in("id", ids);
  if (error) throw error;

  const byId = new Map(
    (data as { id: string; name: string; price: number; stock: number; status: string }[]).map(
      (p) => [p.id, p],
    ),
  );

  return requested.map(({ productId, quantity }) => {
    const product = byId.get(productId);
    if (!product) {
      throw new OrderValidationError(
        "Uno de los productos del pedido ya no está disponible. Actualizá el carrito.",
      );
    }
    if (product.status === "out_of_stock" || product.stock <= 0) {
      throw new OrderValidationError(`${product.name} está agotado.`);
    }
    if (quantity > product.stock) {
      throw new OrderValidationError(
        `Sólo quedan ${product.stock} unidades de ${product.name}.`,
      );
    }
    return {
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
      subtotal: product.price * quantity,
    };
  });
}

function buildComment(
  input: CreateOrderInput,
  totals: OrderTotals,
  couponCode: string | null,
): string | null {
  const parts: string[] = [];
  if (input.deliveryMethod === "delivery" && input.deliveryAddress?.trim()) {
    parts.push(`[Envío a Domicilio: ${input.deliveryAddress.trim()}]`);
  } else if (input.deliveryMethod === "pickup") {
    parts.push("[Retiro en Local - Catriel]");
  }
  if (input.comment?.trim()) parts.push(input.comment.trim());
  if (input.paymentMethod) {
    parts.push(
      input.paymentMethod === "transfer"
        ? "[Pago: Transferencia (10% OFF)]"
        : input.paymentMethod === "cash"
          ? "[Pago: Efectivo en Local (10% OFF)]"
          : "[Pago: Tarjeta / Otros]",
    );
  }
  if (couponCode && totals.couponDiscount > 0) {
    parts.push(`[Cupón: ${couponCode} (-$${totals.couponDiscount})]`);
  }
  return parts.join(" ") || null;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const customerName = input.customerName.trim();
  if (customerName.length < 2 || customerName.length > 100) {
    throw new OrderValidationError("Nombre de cliente inválido.");
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new OrderValidationError("El pedido no tiene productos.");
  }
  for (const item of input.items) {
    if (
      !item?.productId ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0 ||
      item.quantity > MAX_QUANTITY_PER_ITEM
    ) {
      throw new OrderValidationError("Cantidades del pedido inválidas.");
    }
  }

  const orderItems = await priceItems(input.items);

  // A coupon code that no longer validates is simply not applied — the order
  // still goes through at full price rather than failing at the last step.
  let coupon = null;
  if (input.couponCode?.trim()) {
    const check = await checkCoupon(input.couponCode);
    if (check.valid) coupon = check.coupon;
  }

  const deliveryMethod: DeliveryMethod =
    input.deliveryMethod === "delivery" ? "delivery" : "pickup";
  const paymentMethod: PaymentMethod =
    input.paymentMethod === "cash" || input.paymentMethod === "card"
      ? input.paymentMethod
      : "transfer";

  const totals = computeOrderTotals({
    lines: orderItems,
    deliveryMethod,
    paymentMethod,
    coupon,
  });

  const payload: Record<string, unknown> = {
    customer_name: customerName,
    items: orderItems,
    subtotal: totals.subtotal,
    total: totals.total,
    comment: buildComment(input, totals, coupon?.code ?? null),
    status: "pending",
  };

  if (input.customerPhone?.trim()) {
    payload.customer_phone = input.customerPhone.trim().slice(0, 30);
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("orders")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    // If customer_phone column doesn't exist yet, retry without it. PostgREST
    // reports this as PGRST204, not Postgres' 42703 — checking only the latter
    // meant every order that carried a phone number failed outright.
    if (MISSING_COLUMN_CODES.includes(error.code) && payload.customer_phone) {
      delete payload.customer_phone;
      const retry = await admin
        .from("orders")
        .insert(payload)
        .select("*")
        .single();
      if (retry.error) throw retry.error;
      return fromRow(retry.data as OrderRow);
    }
    throw error;
  }

  return fromRow(data as OrderRow);
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
      .maybeSingle();
    if (fetchError) throw fetchError;
    // Product deleted since the order was placed — nothing left to adjust.
    if (!data) continue;

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

// Missing column — "42703" straight from Postgres, "PGRST204" when PostgREST
// rejects the payload against its cached schema. Both mean
// supabase-migration-store-integrity.sql hasn't been run yet; order status
// changes must keep working, they just skip stock adjustment until it lands.
const UNDEFINED_COLUMN = "42703";
const MISSING_COLUMN_CODES = [UNDEFINED_COLUMN, "PGRST204"];

// Stock moves exactly once per order, guarded by a compare-and-swap on
// `stock_applied`: the flag is flipped in the same UPDATE that filters on its
// previous value, so of two concurrent "Confirmado" clicks only one gets rows
// back and only that one adjusts stock. Reading the flag and then writing it
// (the previous shape) let both requests read `false` and decrement twice.
export async function updateOrderStatus(
  id: string,
  status: Order["status"],
): Promise<void> {
  if (!isOrderStatus(status)) {
    throw new Error(`Estado de pedido inválido: ${status}`);
  }

  const admin = supabaseAdmin();

  const current = await admin
    .from("orders")
    .select("status, items")
    .eq("id", id)
    .maybeSingle();
  if (current.error) throw current.error;
  if (!current.data) throw new Error("El pedido no existe");

  const currentStatus = current.data.status as Order["status"];
  const items = current.data.items as OrderItem[];

  // Claim the stock transition, if this change is one.
  let claim: { rows: unknown[] | null; error: { code?: string } | null } | null =
    null;
  let sign: -1 | 1 | null = null;

  if (status === "confirmed" && currentStatus !== "confirmed") {
    sign = -1;
    const res = await admin
      .from("orders")
      .update({ status, stock_applied: true })
      .eq("id", id)
      .eq("stock_applied", false)
      .select("id");
    claim = { rows: res.data, error: res.error };
  } else if (currentStatus === "confirmed" && status === "cancelled") {
    sign = 1;
    const res = await admin
      .from("orders")
      .update({ status, stock_applied: false })
      .eq("id", id)
      .eq("stock_applied", true)
      .select("id");
    claim = { rows: res.data, error: res.error };
  }

  if (claim && !claim.error) {
    // Won the race (rows came back) → move stock. Lost it (empty) → the other
    // request already did, and it also already wrote the status.
    if (claim.rows?.length && sign) await adjustStock(items, sign);
    if (claim.rows?.length) return;
  }

  const missingColumn = MISSING_COLUMN_CODES.includes(claim?.error?.code ?? "");
  if (claim?.error && !missingColumn) {
    throw claim.error;
  }
  if (missingColumn) {
    console.warn(
      "orders.stock_applied column missing — run supabase-migration-store-integrity.sql. Skipping stock adjustment.",
    );
  }

  const { error } = await admin.from("orders").update({ status }).eq("id", id);
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
  paymentMethods?: { transfer: number; cash: number; card: number };
  deliveryMethods?: { pickup: number; delivery: number };
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
    .select("total, items, created_at, comment")
    .gte("created_at", since.toISOString())
    .neq("status", "cancelled");
  if (error) throw error;

  const allOrders = data as Pick<OrderRow, "total" | "items" | "created_at" | "comment">[];

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
  const paymentMethods = { transfer: 0, cash: 0, card: 0 };
  const deliveryMethods = { pickup: 0, delivery: 0 };

  for (const order of orders) {
    const hour = Number(hourOfDay.format(new Date(order.created_at))) % 24;
    ordersByHour.set(hour, (ordersByHour.get(hour) ?? 0) + 1);

    const c = order.comment || "";
    if (c.includes("[Pago: Transferencia")) {
      paymentMethods.transfer += 1;
    } else if (c.includes("[Pago: Efectivo")) {
      paymentMethods.cash += 1;
    } else {
      paymentMethods.card += 1;
    }

    if (c.includes("[Retiro en Local")) {
      deliveryMethods.pickup += 1;
    } else {
      deliveryMethods.delivery += 1;
    }
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
    paymentMethods,
    deliveryMethods,
  };
}
