import type { ProductStatus } from './types'

export const APP_NAME = 'Creatorhub'
export const APP_VERSION = '1.0.0'

export const STATUSES: ProductStatus[] = [
  'solicitado',
  'recibido',
  'testeando',
  'activo',
  'descartado',
]

export const STATUS_LABELS: Record<ProductStatus, string> = {
  solicitado: 'Solicitado',
  recibido: 'Recibido',
  testeando: 'Testeando',
  activo: 'Activo',
  descartado: 'Descartado',
}

// Tailwind-friendly hex per status (matches palette in spec)
export const STATUS_COLORS: Record<ProductStatus, string> = {
  solicitado: '#6B7280', // gris — esperando
  recibido: '#3B82F6',   // azul — ya llegó, pendiente de probar
  testeando: '#F59E0B',  // ámbar — probando
  activo: '#10B981',     // verde — funciona
  descartado: '#EF4444', // rojo — no funcionó
}

// 5-level day color scale. Index 0..5 = level returned by dayColorLevel.
// Each entry: background for light & dark mode.
export const COLOR_LEVELS: { light: string; dark: string }[] = [
  { light: '#FCA5A5', dark: '#7F1D1D' }, // 0  — 0% (rojo)
  { light: '#FDBA74', dark: '#9A3412' }, // 1  — 20-40% (naranja)
  { light: '#FDBA74', dark: '#9A3412' }, // 2  — 20-40% (naranja)
  { light: '#FDE68A', dark: '#92400E' }, // 3  — 60% (amarillo)
  { light: '#86EFAC', dark: '#166534' }, // 4  — 80% (verde claro)
  { light: '#22C55E', dark: '#16A34A' }, // 5  — 100%+ (verde fuerte)
]

export const DEFAULT_VIDEO_GOAL = 5
export const THEME_KEY = 'creatorhub-theme'
export const IMAGE_BUCKET = 'product-images'
