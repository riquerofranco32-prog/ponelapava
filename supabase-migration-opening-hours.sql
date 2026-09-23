-- Poné La Pava — migración de horarios de apertura editables y fechas cerradas
-- Correr en Supabase → SQL Editor (proyecto "ponelapava")
-- Idempotente

alter table site_settings
  add column if not exists opening_hours jsonb,
  add column if not exists closed_dates date[] not null default '{}';

-- Migrar datos iniciales copiando valores actuales:
-- mar–vie = hours_weekday, sáb = hours_saturday, dom y lun cerrados.
-- Mantiene las columnas viejas para compatibilidad durante este release.
update site_settings
set opening_hours = jsonb_build_object(
  'mon', jsonb_build_object('closed', true, 'ranges', '[]'::jsonb),
  'tue', jsonb_build_object('closed', false, 'ranges', jsonb_build_array(jsonb_build_object('open', coalesce(nullif(split_part(replace(hours_weekday, ' ', ''), '–', 1), ''), '09:00'), 'close', coalesce(nullif(split_part(replace(hours_weekday, ' ', ''), '–', 2), ''), '19:00')))),
  'wed', jsonb_build_object('closed', false, 'ranges', jsonb_build_array(jsonb_build_object('open', coalesce(nullif(split_part(replace(hours_weekday, ' ', ''), '–', 1), ''), '09:00'), 'close', coalesce(nullif(split_part(replace(hours_weekday, ' ', ''), '–', 2), ''), '19:00')))),
  'thu', jsonb_build_object('closed', false, 'ranges', jsonb_build_array(jsonb_build_object('open', coalesce(nullif(split_part(replace(hours_weekday, ' ', ''), '–', 1), ''), '09:00'), 'close', coalesce(nullif(split_part(replace(hours_weekday, ' ', ''), '–', 2), ''), '19:00')))),
  'fri', jsonb_build_object('closed', false, 'ranges', jsonb_build_array(jsonb_build_object('open', coalesce(nullif(split_part(replace(hours_weekday, ' ', ''), '–', 1), ''), '09:00'), 'close', coalesce(nullif(split_part(replace(hours_weekday, ' ', ''), '–', 2), ''), '19:00')))),
  'sat', jsonb_build_object('closed', false, 'ranges', jsonb_build_array(jsonb_build_object('open', coalesce(nullif(split_part(replace(hours_saturday, ' ', ''), '–', 1), ''), '09:00'), 'close', coalesce(nullif(split_part(replace(hours_saturday, ' ', ''), '–', 2), ''), '14:00')))),
  'sun', jsonb_build_object('closed', true, 'ranges', '[]'::jsonb)
)
where id = 'default' and (opening_hours is null or opening_hours = '{}'::jsonb);

-- Fallback si no existía fila 'default'
insert into site_settings (id, business_name, whatsapp_number, whatsapp_display, address_line, address_city, hours_weekday, hours_saturday, opening_hours, closed_dates)
values (
  'default',
  'Poné La Pava',
  '5492994650177',
  '+54 9 2994 65-0177',
  'Av. San Martín 450',
  'Catriel, Río Negro',
  '9:00 – 19:00',
  '9:00 – 14:00',
  '{
    "mon": {"closed": true, "ranges": []},
    "tue": {"closed": false, "ranges": [{"open": "09:00", "close": "19:00"}]},
    "wed": {"closed": false, "ranges": [{"open": "09:00", "close": "19:00"}]},
    "thu": {"closed": false, "ranges": [{"open": "09:00", "close": "19:00"}]},
    "fri": {"closed": false, "ranges": [{"open": "09:00", "close": "19:00"}]},
    "sat": {"closed": false, "ranges": [{"open": "09:00", "close": "14:00"}]},
    "sun": {"closed": true, "ranges": []}
  }'::jsonb,
  '{}'
)
on conflict (id) do nothing;
