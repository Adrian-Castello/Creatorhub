-- ============================================================
-- Migración v6: añadir columna `type` a videos
-- ------------------------------------------------------------
-- Distingue entre publicaciones tipo vídeo y carrusel.
-- Los registros existentes se asumen como 'video'.
-- ============================================================

alter table public.videos
  add column if not exists type text not null default 'video'
  check (type in ('video', 'carrusel'));
