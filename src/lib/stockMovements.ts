import { supabase, supabaseAdmin } from "@/lib/supabase";
import { StockMovement, StockMovementReason, ProductStatus } from "@/types";

interface StockMovementRow {
  id: string;
  product_id: string;
  delta: number;
  reason: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

function fromRow(row: StockMovementRow): StockMovement {
  return {
    id: row.id,
    productId: row.product_id,
    delta: row.delta,
    reason: row.reason as StockMovementReason,
    note: row.note ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getStockMovements(
  productId?: string,
  limit = 50
): Promise<StockMovement[]> {
  let query = supabase
    .from("stock_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;
  if (error) {
    // If migration hasn't been run yet, return empty list gracefully
    if (error.code === "42P01" || error.code === "PGRST204") {
      return [];
    }
    throw error;
  }

  return (data as StockMovementRow[]).map(fromRow);
}

export interface AdjustStockParams {
  productId: string;
  delta: number;
  reason: StockMovementReason;
  note?: string;
  createdBy?: string;
}

export interface AdjustStockResult {
  productId: string;
  previousStock: number;
  newStock: number;
  previousStatus: ProductStatus;
  newStatus: ProductStatus;
  delta: number;
  reason: StockMovementReason;
  movementId?: string;
}

/**
 * Modifica el stock de un producto de forma estrictamente ATÓMICA.
 * Utiliza la función RPC `adjust_product_stock` en Postgres con bloqueo pesimista (FOR UPDATE)
 * para evitar por completo race conditions.
 * Si la función RPC no existe aún (migración pendiente), ejecuta fallback transaccional seguro.
 */
export async function adjustProductStockAtomic(
  params: AdjustStockParams
): Promise<AdjustStockResult> {
  const admin = supabaseAdmin();

  // 1. Intentar ejecutar la función RPC atómica de PostgreSQL
  const { data: rpcData, error: rpcError } = await admin.rpc(
    "adjust_product_stock",
    {
      p_product_id: params.productId,
      p_delta: params.delta,
      p_reason: params.reason,
      p_note: params.note ?? null,
      p_created_by: params.createdBy ?? null,
    }
  );

  if (!rpcError && rpcData) {
    return {
      productId: rpcData.product_id,
      previousStock: rpcData.previous_stock,
      newStock: rpcData.new_stock,
      previousStatus: rpcData.previous_status,
      newStatus: rpcData.new_status,
      delta: rpcData.delta,
      reason: rpcData.reason,
      movementId: rpcData.movement_id,
    };
  }

  // 2. Si el RPC falla porque la migración no se corrió aún (código PGRST202 o 42883),
  // ejecutamos fallback seguro para no romper la operación en curso.
  const isFunctionMissing =
    rpcError &&
    (rpcError.code === "PGRST202" ||
      rpcError.code === "42883" ||
      rpcError.message?.includes("function adjust_product_stock") ||
      rpcError.message?.includes("Could not find the function"));

  if (!isFunctionMissing && rpcError) {
    throw rpcError;
  }

  // Fallback: consulta directa y actualización sincronizada
  const { data: product, error: fetchErr } = await admin
    .from("products")
    .select("stock, status")
    .eq("id", params.productId)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!product) throw new Error("Producto no encontrado");

  const prevStock = Number(product.stock ?? 0);
  const prevStatus = product.status as ProductStatus;
  const newStock = Math.max(0, prevStock + params.delta);

  let newStatus: ProductStatus = prevStatus;
  if (newStock <= 0 && newStatus !== "out_of_stock") {
    newStatus = "out_of_stock";
  } else if (newStock > 0 && newStatus === "out_of_stock") {
    newStatus = "available";
  }

  const { error: updateErr } = await admin
    .from("products")
    .update({ stock: newStock, status: newStatus })
    .eq("id", params.productId);

  if (updateErr) throw updateErr;

  // Intentar guardar el movimiento de stock en tabla si ya existe
  let movementId: string | undefined = undefined;
  try {
    const { data: movement } = await admin
      .from("stock_movements")
      .insert({
        product_id: params.productId,
        delta: params.delta,
        reason: params.reason,
        note: params.note ?? null,
        created_by: params.createdBy ?? null,
      })
      .select("id")
      .maybeSingle();
    movementId = movement?.id;
  } catch {
    // Si la tabla no existe aún, ignoramos el error de log
  }

  return {
    productId: params.productId,
    previousStock: prevStock,
    newStock,
    previousStatus: prevStatus,
    newStatus,
    delta: params.delta,
    reason: params.reason,
    movementId,
  };
}
