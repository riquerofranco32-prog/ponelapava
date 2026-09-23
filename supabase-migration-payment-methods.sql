-- Poné La Pava — migración de medios de pago configurables
-- Correr en Supabase → SQL Editor (proyecto "ponelapava")
-- Idempotente: add column if not exists

alter table site_settings
  add column if not exists payment_methods text[] not null default '{transfer,cash,card}';

-- Asegura que la fila 'default' tenga los métodos por defecto si ya existía
update site_settings
set payment_methods = '{transfer,cash,card}'
where id = 'default' and (payment_methods is null or payment_methods = '{}');
