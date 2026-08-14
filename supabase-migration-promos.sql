-- Correr en el dashboard de Supabase → SQL Editor del proyecto "ponelapava"
-- (región São Paulo), ANTES de desplegar los cambios de promos y contenido
-- real de esta sesión. Es seguro correrlo más de una vez.

-- 1. Flag de promoción por producto. El admin lo prende y apaga desde
--    /admin; el sitio público arma con eso la sección y la página de promos.
alter table products
  add column if not exists promo boolean not null default false;

-- Filtrar promos es la consulta más caliente del home y de /promos.
create index if not exists products_promo_idx on products (promo) where promo;

-- 2. Los 19 combos entran sin foto (ver FICHA: las fotos de pack están
--    pendientes) y las cards degradan a tipográficas. La columna venía
--    con `not null` implícito por uso, así que se explicita el default.
alter table products
  alter column images set default '{}';

-- 3. Horarios reales del local: Martes a Sábado de 18 a 21. Domingo y lunes
--    cerrado — eso lo resuelve el código (src/lib/hours.ts), acá solo van
--    las franjas que se muestran.
update site_settings
set hours_weekday = '18:00 – 21:00',
    hours_saturday = '18:00 – 21:00'
where id = 'default';
