-- Run this in the Supabase dashboard → SQL Editor for the "ponelapava" project
-- (São Paulo region), BEFORE deploying this session's admin/stock changes.
-- Safe to run once; `if not exists` makes it a no-op on re-run.

alter table products
  add column if not exists stock integer not null default 0;
