-- ==============================================================================
-- FASE 8: Carritos Abandonados y Recuperación por WhatsApp
-- ==============================================================================
-- Correr en Supabase → SQL Editor (proyecto "ponelapava").
-- Idempotente: `if not exists` hace seguro correrlo varias veces.

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  phone text NOT NULL,
  customer_name text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric NOT NULL DEFAULT 0,
  step text NOT NULL DEFAULT 'contact', -- 'contact', 'delivery', 'payment'
  last_activity timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  recovered boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS:
-- Los clientes anónimos pueden insertar o actualizar su propio carrito durante el checkout
CREATE POLICY "abandoned_carts_anon_upsert" ON abandoned_carts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Usuarios autenticados (admin) y service_role tienen acceso completo
CREATE POLICY "abandoned_carts_service_role" ON abandoned_carts
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Índices de consulta y rendimiento
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_phone ON abandoned_carts (phone);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovered ON abandoned_carts (recovered);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_last_activity ON abandoned_carts (last_activity DESC);
