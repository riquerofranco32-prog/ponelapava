-- ==============================================================================
-- FASE 7: Inventario Profesional, Movimientos de Stock y Proveedores
-- ==============================================================================
-- Correr en Supabase → SQL Editor (proyecto "ponelapava").
-- Idempotente: `if not exists` / `or replace` hacen seguro correrlo varias veces.

-- 1. Tabla de Proveedores (Suppliers)
CREATE TABLE IF NOT EXISTS suppliers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  contact_name text,
  phone text,
  email text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_select_all" ON suppliers
  FOR SELECT USING (true);

CREATE POLICY "suppliers_service_role" ON suppliers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Nuevos campos en products: costo, stock mínimo y proveedor
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT NULL;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS min_stock integer NOT NULL DEFAULT 5;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS supplier_id text REFERENCES suppliers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products (supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_min ON products (stock, min_stock);

-- 3. Tabla de Movimientos de Stock (Audit trail y trazabilidad de inventario)
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL CHECK (reason IN ('sale', 'adjustment', 'purchase', 'return', 'loss')),
  note text,
  created_by text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_movements_select_authenticated" ON stock_movements
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "stock_movements_service_role" ON stock_movements
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements (created_at DESC);

-- 4. Función RPC Atómica para Modificar Stock (Evita Race Conditions)
-- Ejecuta con bloqueo pesimista (FOR UPDATE) sobre el producto, sincroniza
-- estado y registra el movimiento de stock en una sola transacción atómica.
CREATE OR REPLACE FUNCTION adjust_product_stock(
  p_product_id text,
  p_delta integer,
  p_reason text,
  p_note text DEFAULT NULL,
  p_created_by text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock integer;
  v_new_stock integer;
  v_current_status text;
  v_new_status text;
  v_movement_id uuid;
BEGIN
  -- 1. Bloqueo de fila para control de concurrencia
  SELECT stock, status INTO v_current_stock, v_current_status
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto con ID % no encontrado', p_product_id;
  END IF;

  -- 2. Calcular nuevo stock (nunca inferior a 0)
  v_new_stock := GREATEST(0, COALESCE(v_current_stock, 0) + p_delta);
  v_new_status := v_current_status;

  -- 3. Sincronizar estado de disponibilidad automáticamente
  IF v_new_stock <= 0 AND v_new_status <> 'out_of_stock' THEN
    v_new_status := 'out_of_stock';
  ELSIF v_new_stock > 0 AND v_new_status = 'out_of_stock' THEN
    v_new_status := 'available';
  END IF;

  -- 4. Actualizar producto
  UPDATE products
  SET stock = v_new_stock,
      status = v_new_status
  WHERE id = p_product_id;

  -- 5. Registrar movimiento de stock en el log
  INSERT INTO stock_movements (
    product_id,
    delta,
    reason,
    note,
    created_by
  )
  VALUES (
    p_product_id,
    p_delta,
    p_reason,
    p_note,
    p_created_by
  )
  RETURNING id INTO v_movement_id;

  -- 6. Devolver resultado
  RETURN jsonb_build_object(
    'product_id', p_product_id,
    'previous_stock', v_current_stock,
    'new_stock', v_new_stock,
    'previous_status', v_current_status,
    'new_status', v_new_status,
    'delta', p_delta,
    'reason', p_reason,
    'movement_id', v_movement_id
  );
END;
$$;
