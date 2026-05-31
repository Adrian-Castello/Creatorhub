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
/**
 * Devuelve la nota del producto del 1 al 10 según su eficiencia
 * (GMV generado por cada 100k visualizaciones).
 * Devuelve null si no hay visualizaciones suficientes.
 */
export interface ProductScore {
  /** Nota del 1 al 10 */
  score: number
  /** Color del texto/borde */
  color: string
  /** Color de fondo claro */
  bgLight: string
  /** Color de fondo oscuro */
  bgDark: string
}

const SCORE_COLORS: Array<{ color: string; bgLight: string; bgDark: string }> = [
  // 1: rojo profundo
  { color: '#DC2626', bgLight: '#FEE2E2', bgDark: '#451414' },
  // 2: rojo
  { color: '#EF4444', bgLight: '#FECACA', bgDark: '#5C1B1B' },
  // 3: naranja-rojo
  { color: '#F97316', bgLight: '#FED7AA', bgDark: '#5C2E0F' },
  // 4: naranja
  { color: '#FB923C', bgLight: '#FFE4C4', bgDark: '#5A3A18' },
  // 5: ámbar
  { color: '#F59E0B', bgLight: '#FEF3C7', bgDark: '#5C4308' },
  // 6: amarillo limón
  { color: '#EAB308', bgLight: '#FEF9C3', bgDark: '#4D3D08' },
  // 7: verde lima
  { color: '#84CC16', bgLight: '#ECFCCB', bgDark: '#2E430C' },
  // 8: verde
  { color: '#22C55E', bgLight: '#DCFCE7', bgDark: '#0F3D1A' },
  // 9: verde fuerte
  { color: '#16A34A', bgLight: '#BBF7D0', bgDark: '#0E3F1B' },
  // 10: dorado premium
  { color: '#CA8A04', bgLight: '#FEF3C7', bgDark: '#5C4308' },
]

export function productScore(
  gmv: number,
  views: number,
): ProductScore | null {
  if (views < 1000) return null // necesita un mínimo de actividad

  const per100k = (gmv / views) * 100_000

  let score = 1
  if (per100k >= 1500) score = 10
  else if (per100k >= 900) score = 9
  else if (per100k >= 600) score = 8
  else if (per100k >= 400) score = 7
  else if (per100k >= 250) score = 6
  else if (per100k >= 150) score = 5
  else if (per100k >= 100) score = 4
  else if (per100k >= 60) score = 3
  else if (per100k >= 30) score = 2
  else score = 1

  const palette = SCORE_COLORS[score - 1]
  return {
    score,
    color: palette.color,
    bgLight: palette.bgLight,
    bgDark: palette.bgDark,
  }
}

export const DEFAULT_VIDEO_GOAL = 5
export const THEME_KEY = 'creatorhub-theme'
export const IMAGE_BUCKET = 'product-images'
