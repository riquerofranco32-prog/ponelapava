-- Run this in the Supabase dashboard → SQL Editor for the "ponelapava" project
-- (São Paulo region), BEFORE deploying this session's audit-log changes.
-- Safe to run once; `if not exists` makes it a no-op on re-run.

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx
  on audit_log (created_at desc);

-- Admin-only data — no public policy. Only the service-role key
-- (used server-side by /api/admin/*) can read or write this table.
alter table audit_log enable row level security;
