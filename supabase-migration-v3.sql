-- =============================================================
-- Creatorhub — Migración v3: actualizar estados de productos
-- Ejecuta este script en el SQL Editor de Supabase UNA SOLA VEZ
-- si ya tenías la BD montada con los estados antiguos
-- (nuevo / testeando / activo / pausado / descartado).
-- =============================================================

-- 1. Quitar el constraint antiguo (si existe)
alter table public.products
  drop constraint if exists products_status_check;

-- 2. Migrar datos existentes a los nuevos estados
--    nuevo   -> solicitado (lo acabas de pedir, aún no ha llegado)
--    pausado -> recibido   (lo tenías parado, vuelve al flujo)
update public.products set status = 'solicitado' where status = 'nuevo';
update public.products set status = 'recibido'   where status = 'pausado';

-- 3. Cambiar el default y añadir el nuevo constraint
alter table public.products
  alter column status set default 'solicitado';

alter table public.products
  add constraint products_status_check
  check (status in ('solicitado','recibido','testeando','activo','descartado'));
