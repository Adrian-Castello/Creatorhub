import { motion } from 'framer-motion'
import type { Product, Sale, Video } from '../../lib/types'
import { dayColorLevel, dayTotals } from '../../lib/calculations'
import { COLOR_LEVELS } from '../../lib/constants'
import { toKey, todayKey } from '../../lib/dates'
import { eurCompact } from '../../lib/format'

interface Props {
  date: Date
  monthAnchor: Date
  goal: number
  sales: Sale[]
  videos: Video[]
  products: Product[]
  isDark: boolean
  onOpen: (key: string) => void
}

export function DayCell({
  date,
  monthAnchor,
  goal,
  sales,
  videos,
  products,
  isDark,
  onOpen,
}: Props) {
  const key = toKey(date)
  const inMonth = date.getMonth() === monthAnchor.getMonth()
  const isToday = key === todayKey()

  const totals = dayTotals(key, sales, products, videos)
  const hasActivity = totals.videos > 0 || totals.gmv > 0
  const level = dayColorLevel(totals.videos, goal)

  let bg: string | undefined
  let textOnTint = false
  if (totals.videos > 0) {
    bg = isDark ? COLOR_LEVELS[level].dark : COLOR_LEVELS[level].light
    textOnTint = true
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onOpen(key)}
      title={
        hasActivity
          ? `${totals.videos} vídeos · ${eurCompact(totals.gmv)} GMV · ${eurCompact(totals.commission)} com.`
          : undefined
      }
      className={`relative flex aspect-square flex-col rounded-xl border p-1.5 text-left transition-all sm:p-2 ${
        bg ? 'border-transparent' : 'surface'
      } ${inMonth ? '' : 'opacity-35'} ${
        isToday ? 'ring-2 ring-brand shadow-glow' : ''
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

      {totals.videos > 0 && (
        <span
          className={`mt-0.5 hidden text-[10px] tnum sm:block ${
            isDark ? 'text-white/70' : 'text-black/55'
          }`}
        >
          {totals.videos}/{goal} 🎬
        </span>
      )}

      {totals.gmv > 0 && (
        <span
          className={`mt-auto flex items-center gap-1 text-[10px] font-medium tnum ${
            textOnTint
              ? isDark
                ? 'text-white/90'
                : 'text-black/70'
              : 'text-accent'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
          {eurCompact(totals.gmv)}
        </span>
      )}
    </motion.button>
  )
}
