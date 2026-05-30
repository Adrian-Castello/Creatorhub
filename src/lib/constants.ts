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

/**
 * Tintes suaves para el fondo de la card del producto (light/dark).
 * Muy bajos en saturación para que las cards se vean elegantes,
 * con el color justo para identificar el estado de un vistazo.
 */
export const STATUS_TINTS: Record<
  ProductStatus,
  { lightBg: string; darkBg: string; lightBorder: string; darkBorder: string }
> = {
  solicitado: {
    lightBg: '#F3F4F6',  // gris muy claro
    darkBg: '#1F2024',
    lightBorder: '#E5E7EB',
    darkBorder: '#2F3036',
  },
  recibido: {
    lightBg: '#EFF6FF',  // azul muy claro
    darkBg: '#172033',
    lightBorder: '#DBEAFE',
    darkBorder: '#1E2D45',
  },
  testeando: {
    lightBg: '#FFFBEB',  // ámbar muy claro
    darkBg: '#2A2010',
    lightBorder: '#FEF3C7',
    darkBorder: '#3D2D14',
  },
  activo: {
    lightBg: '#ECFDF5',  // verde menta muy claro
    darkBg: '#0F2620',
    lightBorder: '#D1FAE5',
    darkBorder: '#163A2F',
  },
  descartado: {
    lightBg: '#FEF2F2',  // rojo muy claro
    darkBg: '#2A1515',
    lightBorder: '#FECACA',
    darkBorder: '#3D1E1E',
  },
}

// 5-level day color scale. Index 0..5 = level returned by dayColorLevel.
// Each entry: background for light & dark mode.
export const COLOR_LEVELS: { light: string; dark: string }[] = [
  { light: '#F3F4F6', dark: '#1F2024' }, // 0 — sin actividad (gris muy suave)
  { light: '#F87171', dark: '#7F1D1D' }, // 1 — bajo (rojo)
  { light: '#FB923C', dark: '#9A3412' }, // 2 — medio-bajo (naranja)
  { light: '#86EFAC', dark: '#166534' }, // 3 — medio (verde claro)
  { light: '#4ADE80', dark: '#15803D' }, // 4 — alto (verde medio)
  { light: '#22C55E', dark: '#16A34A' }, // 5 — top (verde fuerte)
  { light: '#FCD34D', dark: '#CA8A04' }, // 6 — premium / día increíble (amarillo dorado vibrante)
]

export const DEFAULT_VIDEO_GOAL = 5
export const THEME_KEY = 'creatorhub-theme'
export const IMAGE_BUCKET = 'product-images'
