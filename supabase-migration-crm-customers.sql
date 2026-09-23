-- Migration: CRM Customers entity, E.164 phone normalization and order link
-- Safe to re-run; uses IF NOT EXISTS and DO blocks.

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  phone_normalized text unique not null,
  name text not null,
  email text,
  notes text,
  tags text[] not null default '{}',
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_phone_normalized_idx on customers (phone_normalized);
create index if not exists customers_follow_up_idx on customers (follow_up_at) where follow_up_at is not null;
create index if not exists customers_created_at_idx on customers (created_at desc);

-- RLS: Admin service-role only (same as audit_log and site_settings)
alter table customers enable row level security;

-- Add customer_id column to orders table if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'orders' and column_name = 'customer_id'
  ) then
    alter table orders add column customer_id uuid references customers(id) on delete set null;
  end if;
end $$;

create index if not exists orders_customer_id_idx on orders (customer_id);
