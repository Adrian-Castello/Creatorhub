-- =============================================================
-- Creatorhub — Esquema completo de base de datos + Storage
-- Pega TODO este archivo en el SQL Editor de Supabase y ejecútalo.
-- =============================================================

-- Necesario para gen_random_uuid()
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- Tabla: products
-- -------------------------------------------------------------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  image_url      text,
  commission_pct numeric(5,2) not null default 0,
  price          numeric(10,2) not null default 0,
  status         text not null default 'solicitado'
                 check (status in ('solicitado','recibido','testeando','activo','muestra','carruseles','descartado')),
  created_at     timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Tabla: videos
-- Cada fila = un vídeo COMPLETADO. Si no hay fila, el slot está sin marcar.
-- -------------------------------------------------------------
create table if not exists public.videos (
  id          uuid primary key default gen_random_uuid(),
  day_date    date not null,
  slot        int not null,
  product_id  uuid references public.products(id) on delete set null,
  type        text not null default 'video' check (type in ('video','carrusel')),
  created_at  timestamptz not null default now(),
  unique (day_date, slot)
);

create index if not exists idx_videos_day_date on public.videos (day_date);

-- -------------------------------------------------------------
-- Tabla: sales
-- Un registro de ventas por producto y día (se actualiza, no se duplica).
-- -------------------------------------------------------------
create table if not exists public.sales (
  id          uuid primary key default gen_random_uuid(),
  day_date    date not null,
  product_id  uuid not null references public.products(id) on delete cascade,
  units       int not null default 0,
  gmv         numeric(10,2) not null default 0,
  created_at  timestamptz not null default now(),
  unique (day_date, product_id)
);

create index if not exists idx_sales_day_date   on public.sales (day_date);
create index if not exists idx_sales_product_id on public.sales (product_id);

-- -------------------------------------------------------------
-- Tabla: day_notes
-- -------------------------------------------------------------
create table if not exists public.day_notes (
  day_date    date primary key,
  notes       text not null default '',
  updated_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Tabla: day_views
-- Visualizaciones por producto y día (se actualiza, no se duplica).
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- Tabla: extra_income
-- Ingresos fuera de comisiones de venta (cupones de TikTok, bonus
-- por competiciones, etc).
-- -------------------------------------------------------------
create table if not exists public.extra_income (
  id          uuid primary key default gen_random_uuid(),
  day_date    date not null,
  kind        text not null check (kind in ('cupon','bonus')),
  amount      numeric(10,2) not null default 0,
  description text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists idx_extra_income_day_date on public.extra_income (day_date);

-- -------------------------------------------------------------
-- Tabla: app_settings (singleton, id = 1)
-- -------------------------------------------------------------
create table if not exists public.app_settings (
  id                int primary key default 1,
  daily_video_goal  int not null default 5,
  user_name         text,
  updated_at        timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);

-- Seed de la fila singleton
insert into public.app_settings (id, daily_video_goal)
values (1, 5)
on conflict (id) do nothing;

-- =============================================================
-- Row Level Security (RLS)
-- =============================================================
-- SIN AUTH (estado actual): políticas permisivas para el rol `anon`.
-- ⚠️  AL AÑADIR AUTH: sustituye `to anon` por `to authenticated` y añade
--     condiciones por `auth.uid()` (ver README, sección "Activar auth").
-- =============================================================

alter table public.products     enable row level security;
alter table public.videos       enable row level security;
alter table public.sales        enable row level security;
alter table public.day_notes    enable row level security;
alter table public.day_views    enable row level security;
alter table public.extra_income enable row level security;
alter table public.app_settings enable row level security;

-- products
create policy "anon_all_products" on public.products
  for all to anon using (true) with check (true);

-- videos
create policy "anon_all_videos" on public.videos
  for all to anon using (true) with check (true);

-- sales
create policy "anon_all_sales" on public.sales
  for all to anon using (true) with check (true);

-- day_notes
create policy "anon_all_day_notes" on public.day_notes
  for all to anon using (true) with check (true);

-- day_views
create policy "anon_all_day_views" on public.day_views
  for all to anon using (true) with check (true);

-- extra_income
create policy "anon_all_extra_income" on public.extra_income
  for all to anon using (true) with check (true);

-- app_settings
create policy "anon_all_app_settings" on public.app_settings
  for all to anon using (true) with check (true);

-- =============================================================
-- Storage: bucket público `product-images`
-- =============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Lectura pública
create policy "public_read_product_images" on storage.objects
  for select to public
  using (bucket_id = 'product-images');

-- Escritura/borrado desde anon (⚠️ restringir al añadir auth)
create policy "anon_insert_product_images" on storage.objects
  for insert to anon
  with check (bucket_id = 'product-images');

create policy "anon_update_product_images" on storage.objects
  for update to anon
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

create policy "anon_delete_product_images" on storage.objects
  for delete to anon
  using (bucket_id = 'product-images');
