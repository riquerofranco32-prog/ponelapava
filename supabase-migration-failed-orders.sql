-- Run this in the Supabase dashboard → SQL Editor for the "ponelapava" project
-- (São Paulo region), BEFORE deploying this session's failed-order changes.
-- Safe to run once; `if not exists` makes it a no-op on re-run.
--
-- Guarda los intentos de pedido que el servidor rechazó. Antes de esto un
-- pedido con un pack o un kit armado abría WhatsApp, era rechazado por
-- priceItems() y desaparecía: el cliente creía haber comprado y en el admin no
-- quedaba nada. La venta sigue cerrándose por WhatsApp pase lo que pase; lo que
-- cambia es que el fallo deja rastro.
--
-- Mientras esta tabla no exista, /api/orders no se rompe: escribe el intento
-- completo en los logs del servidor (Vercel) y responde igual. Correr esta
-- migración convierte ese log efímero en un registro consultable desde
-- /admin/pedidos.

create table if not exists failed_orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  items jsonb not null default '[]'::jsonb,
  reason text not null,
  stage text not null,
  created_at timestamptz not null default now()
);

create index if not exists failed_orders_created_at_idx
  on failed_orders (created_at desc);

-- Datos de clientes — sin política pública, igual que audit_log y orders.
-- Sólo la service-role key (server-side) puede leer o escribir esta tabla.
alter table failed_orders enable row level security;
