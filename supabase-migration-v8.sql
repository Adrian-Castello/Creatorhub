-- ============================================================
-- Migración v8: histórico de objetivos diarios de publicaciones
-- ------------------------------------------------------------
-- Cada cambio del objetivo se guarda con la fecha desde la que aplica.
-- Para saber el objetivo de un día X, se busca el registro más reciente
-- cuyo `day_date <= X`.
-- ============================================================

create table if not exists public.goal_history (
  id          uuid primary key default gen_random_uuid(),
  day_date    date not null,
  goal        int not null check (goal > 0),
  created_at  timestamptz not null default now()
);

create index if not exists idx_goal_history_day_date on public.goal_history (day_date);

alter table public.goal_history enable row level security;

drop policy if exists anon_all_goal_history on public.goal_history;
create policy anon_all_goal_history
  on public.goal_history
  for all
  to anon
  using (true)
  with check (true);

-- Sembramos el registro inicial con el objetivo actual de app_settings,
-- aplicado desde una fecha muy antigua para que cubra todo el histórico.
insert into public.goal_history (day_date, goal)
select
  date '2000-01-01',
  coalesce((select daily_video_goal from public.app_settings where id = 1), 5)
where not exists (select 1 from public.goal_history);
