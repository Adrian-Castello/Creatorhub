-- ============================================================
-- Migración v5: nueva tabla extra_income
-- ------------------------------------------------------------
-- Para registrar ingresos fuera de comisiones de venta:
--   - cupon: créditos de TikTok Shop (solo gastables dentro de TikTok)
--   - bonus: dinero por competiciones / premios del top creator
-- ============================================================

-- 1) Crear la tabla
create table if not exists public.extra_income (
  id          uuid primary key default gen_random_uuid(),
  day_date    date not null,
  kind        text not null check (kind in ('cupon','bonus')),
  amount      numeric(10,2) not null default 0,
  description text not null default '',
  created_at  timestamptz not null default now()
);

-- 2) Índice por fecha (para consultas por período rápidas)
create index if not exists idx_extra_income_day_date on public.extra_income (day_date);

-- 3) RLS — permisivo para anon (igual que el resto de tablas)
alter table public.extra_income enable row level security;

drop policy if exists anon_all_extra_income on public.extra_income;
create policy anon_all_extra_income
  on public.extra_income
  for all
  to anon
  using (true)
  with check (true);
