-- =============================================================
-- Creatorhub — Migración v2: añadir columna `visits` a day_notes
-- Ejecuta este script en el SQL Editor de Supabase UNA SOLA VEZ
-- si ya tenías la BD creada con el supabase.sql original.
-- (Las instalaciones nuevas no necesitan ejecutar este archivo
--  porque la columna ya está en supabase.sql.)
-- =============================================================

alter table public.day_notes
  add column if not exists visits int not null default 0;
