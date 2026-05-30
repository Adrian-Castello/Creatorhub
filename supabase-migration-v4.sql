-- =============================================================
-- Creatorhub — Migración v4: visualizaciones por producto
-- Ejecuta este script en el SQL Editor de Supabase UNA SOLA VEZ
-- =============================================================
-- Hasta ahora las visualizaciones se guardaban como un único
-- número por día (en day_notes.visits). Ahora se guardan por
-- producto, como las ventas.

-- 1. Crear la nueva tabla
create table if not exists public.day_views (
  id          uuid primary key default gen_random_uuid(),
  day_date    date not null,
  product_id  uuid not null references public.products(id) on delete cascade,
  views       int not null default 0,
  created_at  timestamptz not null default now(),
  unique (day_date, product_id)
);

create index if not exists idx_day_views_day_date   on public.day_views (day_date);
create index if not exists idx_day_views_product_id on public.day_views (product_id);

-- 2. RLS
alter table public.day_views enable row level security;

create policy "anon_all_day_views" on public.day_views
  for all to anon using (true) with check (true);

-- 3. (Opcional) eliminar la columna `visits` de `day_notes`.
--    NO la borramos por seguridad para no perder los datos que ya
--    tienes registrados. Si quieres limpiarlo después, descomenta:
-- alter table public.day_notes drop column if exists visits;
