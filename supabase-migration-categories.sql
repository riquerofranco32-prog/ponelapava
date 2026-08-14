-- Run this in the Supabase dashboard → SQL Editor for the "ponelapava" project
-- (São Paulo region), BEFORE deploying this session's admin/categories changes.
-- Safe to run once; `if not exists` / `on conflict do nothing` make it a no-op on re-run.

create table if not exists categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text not null unique,
  description text not null default '',
  image text not null default '',
  icon text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Seed with the categories that were previously hardcoded in
-- src/data/categories.ts, so existing products (which reference these
-- slugs in their `category` column) keep working.
insert into categories (name, slug, description, image, icon, sort_order)
values
  ('Yerbas', 'yerbas', 'Las mejores yerbas del mercado, seleccionadas con criterio.', '/category_yerbas_1786545980521.png', '🌿', 1),
  ('Mates', 'mates', 'Mates de calabaza, madera, acero y más.', '/category_mates_1786545993698.png', '🫙', 2),
  ('Bombillas', 'bombillas', 'Bombillas de alpaca, acero y filtrantes.', '/category_bombillas_1786546023442.png', '✨', 3),
  ('Termos', 'termos', 'Termos Stanley, Lumilagro y más marcas premium.', '/category_termos_1786546003986.png', '🌡️', 4),
  ('Accesorios', 'accesorios', 'Todo lo que necesitás para el mate perfecto.', '/about_section_1786546070863.png', '🎁', 5),
  ('Combos', 'combos', 'Kits completos para regalar o empezar.', '/category_combos_1786546035458.png', '📦', 6)
on conflict (slug) do nothing;
