import { motion } from 'framer-motion'
import type { DayView, Product, Sale, Video } from '../../lib/types'
import { dayColorLevel, dayTotals } from '../../lib/calculations'
import { COLOR_LEVELS } from '../../lib/constants'
import { toKey, todayKey } from '../../lib/dates'
import { eur, eurCompact, numCompact } from '../../lib/format'

export type CalendarMode = 'publicaciones' | 'monetizacion'

interface Props {
  date: Date
  monthAnchor: Date
  goal: number
  sales: Sale[]
  videos: Video[]
  products: Product[]
  dayViews: DayView[]
  mode: CalendarMode
  isDark: boolean
  selectedKey: string | null
  onOpen: (key: string) => void
}

// Niveles de color para monetización: del más bajo al más alto GMV.
function monetizationLevel(gmv: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  if (gmv <= 0) return 0
  if (gmv < 100) return 1    // rojo
  if (gmv < 200) return 2    // naranja
  if (gmv < 400) return 3    // verde claro
  if (gmv < 600) return 4    // verde medio
  if (gmv < 900) return 5    // verde fuerte
  return 6                   // ≥ 900 — día increíble (amarillo premium)
}

export function DayCell({
  date,
  monthAnchor,
  goal,
  sales,
  videos,
  products,
  dayViews,
  mode,
  isDark,
  selectedKey,
  onOpen,
}: Props) {
  const key = toKey(date)
  const inMonth = date.getMonth() === monthAnchor.getMonth()
  const isToday = key === todayKey()
  // El anillo lo lleva el día seleccionado (o, si no hay selección, el día de hoy).
  const isHighlighted = selectedKey ? key === selectedKey : isToday

  const totals = dayTotals(key, sales, products, videos)
  const dayTotalViews = dayViews
    .filter((v) => v.day_date === key)
    .reduce((a, v) => a + v.views, 0)

  // El color de fondo depende del modo
  const level =
    mode === 'publicaciones'
      ? dayColorLevel(totals.videos, goal)
      : monetizationLevel(totals.gmv)

  let bg: string | undefined
  let textOnTint = false
  const showColor =
    mode === 'publicaciones' ? totals.videos > 0 : totals.gmv > 0
  if (showColor) {
    bg = isDark ? COLOR_LEVELS[level].dark : COLOR_LEVELS[level].light
    textOnTint = true
  }

  const subColor = textOnTint
    ? isDark
      ? 'text-white/85'
      : 'text-black/65'
    : 'text-muted'

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onOpen(key)}
      className={`relative flex aspect-square flex-col rounded-xl border p-1.5 text-left transition-all sm:p-2 ${
        bg ? 'border-transparent' : 'surface'
      } ${inMonth ? '' : 'opacity-35'} ${
        isHighlighted ? 'ring-2 ring-brand shadow-glow' : ''
      }`}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      <span
        className={`text-xs font-semibold tnum sm:text-sm ${
          textOnTint
            ? isDark
              ? 'text-white/90'
              : 'text-black/70'
            : 'text-ink dark:text-d-ink'
        }`}
      >
        {date.getDate()}
      </span>

      {/* Modo PUBLICACIONES: solo número de vídeos arriba */}
      {mode === 'publicaciones' && totals.videos > 0 && (
        <span className={`mt-0.5 hidden text-[10px] tnum sm:block ${subColor}`}>
          {totals.videos}/{goal} 🎬
        </span>
      )}

      {/* Modo MONETIZACIÓN: vistas en medio (pequeño), GMV abajo (destacado) */}
      {mode === 'monetizacion' && (
        <>
          {dayTotalViews > 0 && (
            <span className={`mt-0.5 hidden text-[10px] tnum sm:block ${subColor}`}>
              {numCompact(dayTotalViews)} 👁
            </span>
          )}
          {totals.gmv > 0 && (
            <span
              className={`mt-auto text-[11px] font-semibold tnum sm:text-xs ${
                textOnTint
                  ? isDark
                    ? 'text-white'
                    : 'text-black/85'
                  : 'text-accent'
              }`}
            >
              <span className="sm:hidden">{eurCompact(totals.gmv)}</span>
              <span className="hidden sm:inline">{eur(totals.gmv)}</span>
            </span>
          )}
        </>
      )}
    </motion.button>
  )
}
