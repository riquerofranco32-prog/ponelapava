-- Run this in the Supabase dashboard → SQL Editor for the "ponelapava" project
-- BEFORE deploying this session's admin/cupones changes.
-- Safe to run once; `if not exists` makes it a no-op on re-run.

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

-- Only /admin (service role key) reads/writes this table — no public policy,
-- since coupons are applied manually by staff when writing up the WhatsApp
-- order and are never read from the storefront.
alter table coupons enable row level security;
