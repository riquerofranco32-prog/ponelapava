-- Poné La Pava — migración de integridad y seguridad de la tienda.
-- Correr en Supabase → SQL Editor (proyecto "ponelapava", región São Paulo).
-- Idempotente: `if not exists` / `drop policy if exists` la hacen segura de
-- correr más de una vez.
--
-- Consolida y reemplaza a:
--   supabase-migration-coupons.sql
--   supabase-migration-landing.sql
--   supabase-migration-audit-log.sql
--   supabase-migration-order-stock-applied.sql
--   supabase-migration-categories-rls.sql
--
-- Auditoría 2026-08-28: las tres primeras nunca se corrieron — `coupons`,
-- `landing_content` y `audit_log` no existían en la base, así que /admin/cupones
-- devolvía 500, el editor de la landing decía "guardado" sin persistir nada y
-- el registro de actividad rompía la página.

-- ── 1. Tablas faltantes ────────────────────────────────────────────────

create table if not exists coupons (
  id text primary key default gen_random_uuid()::text,
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  valid_from timestamptz,
  valid_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists landing_content (
  id text primary key default 'default',
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on audit_log (created_at desc);

-- ── 2. Columnas faltantes ──────────────────────────────────────────────

-- Guarda de idempotencia del stock: garantiza que confirmar un pedido
-- descuente stock una sola vez, incluso con dos clicks simultáneos
-- (updateOrderStatus hace compare-and-swap sobre esta columna).
alter table orders
  add column if not exists stock_applied boolean not null default false;

alter table products
  add column if not exists stock integer not null default 0;

-- Teléfono del cliente: la app lo escribe desde el checkout y /seguimiento
-- busca por él. La columna nunca se había creado, así que todo pedido que
-- incluía teléfono fallaba al insertarse (auditoría 2026-08-28).
alter table orders
  add column if not exists customer_phone text;

create index if not exists orders_customer_phone_idx on orders (customer_phone);

-- ── 3. Índices de las consultas reales ─────────────────────────────────

create index if not exists products_category_idx on products (category);
create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);

-- ── 4. RLS: la web pública sólo lee ────────────────────────────────────
--
-- Todas las escrituras del admin y la creación de pedidos pasan por rutas
-- del servidor que usan la service-role key (que ignora RLS). El navegador
-- nunca necesita escribir: con la anon key sólo puede leer catálogo,
-- categorías, configuración y landing. Sin estas políticas, cualquiera con
-- la anon key —que viaja en el bundle del cliente, por diseño— podría
-- cambiar precios o borrar productos directamente contra PostgREST.

alter table products enable row level security;
alter table categories enable row level security;
alter table site_settings enable row level security;
alter table landing_content enable row level security;
alter table orders enable row level security;
alter table coupons enable row level security;
alter table audit_log enable row level security;

do $$
declare t text;
begin
  foreach t in array array['products', 'categories', 'site_settings', 'landing_content']
  loop
    execute format('drop policy if exists "public read %1$s" on %1$I', t);
    execute format(
      'create policy "public read %1$s" on %1$I for select to anon, authenticated using (true)',
      t
    );
    -- Cualquier política de escritura previa (incluidas las permisivas que
    -- creaba supabase-migration-landing.sql) queda eliminada.
    execute format('drop policy if exists "public write %1$s" on %1$I', t);
    execute format('drop policy if exists "Allow admin write on %1$s" on %1$I', t);
    execute format('drop policy if exists "Enable insert for all users" on %1$I', t);
    execute format('drop policy if exists "Enable update for all users" on %1$I', t);
    execute format('drop policy if exists "Enable delete for all users" on %1$I', t);
  end loop;
end $$;

-- `orders`, `coupons` y `audit_log` no llevan ninguna política: RLS activo sin
-- policy = nadie con anon key entra. Sólo la service-role key (servidor).

-- ── 5. Verificación ────────────────────────────────────────────────────
-- Después de correr esto, este SELECT debe listar sólo políticas de tipo
-- SELECT sobre products / categories / site_settings / landing_content:
--
--   select tablename, policyname, cmd, roles
--   from pg_policies where schemaname = 'public' order by tablename;
