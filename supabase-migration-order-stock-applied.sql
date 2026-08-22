-- Run this in the Supabase dashboard → SQL Editor for the "ponelapava" project
-- (São Paulo region), BEFORE deploying this session's order-stock changes.
-- Safe to run once; `if not exists` makes it a no-op on re-run.

alter table orders
  add column if not exists stock_applied boolean not null default false;
