-- Security hardening (2026-09-24). Idempotent.

-- 1. adjust_product_stock is SECURITY DEFINER: only the server (service_role) may call it.
revoke execute on function public.adjust_product_stock(text, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.adjust_product_stock(text, integer, text, text, text) to service_role;
alter function public.adjust_product_stock(text, integer, text, text, text) set search_path = public, pg_temp;

-- 2. abandoned_carts: all reads/writes go through server routes with the service role.
drop policy if exists abandoned_carts_anon_upsert on public.abandoned_carts;

-- 3. suppliers hold phones/emails: no public read.
drop policy if exists suppliers_select_all on public.suppliers;

-- 4. admin_users: a signed-in user may only see their own row (middleware needs exactly that).
drop policy if exists admin_users_select_authenticated on public.admin_users;
create policy admin_users_select_own on public.admin_users
  for select to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

-- 5. Duplicate public-read policies (performance advisor).
drop policy if exists "public read categories" on public.categories;
drop policy if exists "public read products" on public.products;
drop policy if exists "public read site_settings" on public.site_settings;
