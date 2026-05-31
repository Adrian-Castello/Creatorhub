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

/**
 * Niveles de calificación de un producto según su eficiencia
 * GMV generado por cada 100k visualizaciones.
 *  - 0:  Cobre    (< 150 €)
 *  - 1:  Bronce   (150 – 300 €)
 *  - 2:  Plata    (300 – 700 €)
 *  - 3:  Oro      (700 – 1.500 €)
 *  - 4:  Diamante (> 1.500 €)
 *
 * El último tier usa emoji 💎 (gema), los anteriores 🏅 (medalla) con el color metálico
 * de fondo. Si el producto no tiene visualizaciones, no se muestra tier.
 */
export interface ProductTier {
  /** Número de tier (1 = mejor, 5 = peor) */
  number: 1 | 2 | 3 | 4 | 5
  /** Color del fondo de la card (claro / oscuro) */
  bg: { light: string; dark: string }
  /** Color del texto sobre la card */
  fg: { light: string; dark: string }
  /** Descripción corta para tooltips o leyenda */
  description: string
}

// Índice del array = posición visual; el `number` real lo lleva cada tier.
// Tier 1 (mejor) primero, Tier 5 (peor) último.
export const PRODUCT_TIERS: ProductTier[] = [
  {
    number: 1,
    bg: { light: '#CFFAFE', dark: '#155E75' },
    fg: { light: '#0E7490', dark: '#A5F3FC' },
    description: 'Más de 1.500 € por cada 100k visualizaciones',
  },
  {
    number: 2,
    bg: { light: '#FEF3C7', dark: '#713F12' },
    fg: { light: '#A16207', dark: '#FDE68A' },
    description: '700 – 1.500 € por cada 100k visualizaciones',
  },
  {
    number: 3,
    bg: { light: '#E5E7EB', dark: '#374151' },
    fg: { light: '#4B5563', dark: '#D1D5DB' },
    description: '300 – 700 € por cada 100k visualizaciones',
  },
  {
    number: 4,
    bg: { light: '#FFE4C4', dark: '#5A3A18' },
    fg: { light: '#92400E', dark: '#F4C97D' },
    description: '150 – 300 € por cada 100k visualizaciones',
  },
  {
    number: 5,
    bg: { light: '#FEE2D6', dark: '#5C2E0F' },
    fg: { light: '#B45309', dark: '#FCD8B4' },
    description: 'Menos de 150 € por cada 100k visualizaciones',
  },
]

/**
 * Devuelve el tier del producto en base a su eficiencia.
 * Tier 1 = mejor, Tier 5 = peor.
 * Devuelve null si no hay visualizaciones suficientes para calcular.
 */
export function productTier(
  gmv: number,
  views: number,
): { tier: ProductTier } | null {
  if (views < 1000) return null
  const per100k = (gmv / views) * 100_000
  let index = 4 // por defecto Tier 5 (peor)
  if (per100k >= 1500) index = 0      // Tier 1
  else if (per100k >= 700) index = 1  // Tier 2
  else if (per100k >= 300) index = 2  // Tier 3
  else if (per100k >= 150) index = 3  // Tier 4
  return { tier: PRODUCT_TIERS[index] }
}

export const DEFAULT_VIDEO_GOAL = 5
export const THEME_KEY = 'creatorhub-theme'
export const IMAGE_BUCKET = 'product-images'
