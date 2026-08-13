import { supabase, supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem, CartItem } from "@/types";

interface OrderRow {
  id: string;
  customer_name: string;
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

  const { error } = await supabase.from("orders").insert({
    customer_name: input.customerName,
    items: orderItems,
    subtotal: input.total,
    total: input.total,
    comment: input.comment || null,
  });
  if (error) throw error;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(fromRow);
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export interface DashboardStats {
  totalRevenue: number;
  orderCount: number;
  avgTicket: number;
  salesByDay: { date: string; total: number }[];
  topProducts: { name: string; quantity: number }[];
}

// Last 14 days of orders drive both the revenue KPIs and the sales chart —
// enough to be useful for a small shop without pulling the whole history
// on every dashboard load.
const STATS_WINDOW_DAYS = 14;

export async function getDashboardStats(): Promise<DashboardStats> {
  const since = new Date();
  since.setDate(since.getDate() - STATS_WINDOW_DAYS);

  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("total, items, created_at")
    .gte("created_at", since.toISOString())
    .neq("status", "cancelled");
  if (error) throw error;

  const orders = data as Pick<OrderRow, "total" | "items" | "created_at">[];

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;
  const avgTicket = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  const byDay = new Map<string, number>();
  for (let i = STATS_WINDOW_DAYS - 1; i >= 0; i--) {
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

  return { totalRevenue, orderCount, avgTicket, salesByDay, topProducts };
}
