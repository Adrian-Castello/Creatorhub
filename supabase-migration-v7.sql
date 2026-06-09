-- ============================================================
-- Migración v7: añadir estados muestra y carruseles a products
-- ------------------------------------------------------------
-- Estados nuevos:
--   - muestra:    producto que TikTok te ha dado y debes subir contenido
--   - carruseles: producto que no tienes pero subes en carruseles
-- ============================================================

-- Eliminar el check antiguo y crear uno nuevo con los nuevos estados.
alter table public.products
  drop constraint if exists products_status_check;

alter table public.products
  add constraint products_status_check
  check (status in ('solicitado','recibido','testeando','activo','muestra','carruseles','descartado'));
