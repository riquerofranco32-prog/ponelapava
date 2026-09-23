-- Migration: Extended order statuses workflow and separate payment tracking
-- Circuit: pending -> confirmed -> preparing -> ready -> delivered | cancelled
-- Safe to re-run; uses IF NOT EXISTS and DO blocks.

do $$
declare
  constraint_name text;
begin
  -- Dropear constraints previas de status para permitir los nuevos estados
  for constraint_name in (
    select conname
    from pg_constraint
    where conrelid = 'orders'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
      and conname != 'orders_payment_status_check'
  ) loop
    execute format('alter table orders drop constraint if exists %I', constraint_name);
  end loop;
end $$;

-- Aplicar nuevo check constraint con los 6 estados del circuito completo
alter table orders
  add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'));

-- Agregar columna payment_status separada del estado del pedido
alter table orders
  add column if not exists payment_status text not null default 'unpaid';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'orders'::regclass and conname = 'orders_payment_status_check'
  ) then
    alter table orders
      add constraint orders_payment_status_check
      check (payment_status in ('unpaid', 'paid'));
  end if;
end $$;

-- Fecha en la que se registró el cobro
alter table orders
  add column if not exists paid_at timestamptz;

-- Índices para acelerar filtros de pedidos
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_payment_status_idx on orders (payment_status);
create index if not exists orders_paid_at_idx on orders (paid_at);
