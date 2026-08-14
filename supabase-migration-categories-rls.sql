-- Run this in the Supabase dashboard → SQL Editor for the "ponelapava" project.
-- Fixes: the `categories` table was created with RLS enabled by default and no
-- policy, so the public site (using the anon key) got an empty list back even
-- though the rows exist — only /admin (service role key, bypasses RLS) could see them.
-- Safe to run once; `if not exists` makes it a no-op on re-run.

alter table categories enable row level security;

drop policy if exists "Public read access to categories" on categories;

create policy "Public read access to categories"
  on categories for select
  to anon, authenticated
  using (true);
