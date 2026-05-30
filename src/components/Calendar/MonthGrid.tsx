import { AnimatePresence, motion } from 'framer-motion'
import type { DayView, Product, Sale, Video } from '../../lib/types'
import { monthGridDays, WEEKDAY_SHORT } from '../../lib/dates'
import { DayCell, type CalendarMode } from './DayCell'

interface Props {
  monthAnchor: Date
  direction: number
  goal: number
  sales: Sale[]
  videos: Video[]
  products: Product[]
  dayViews: DayView[]
  mode: CalendarMode
  isDark: boolean
  onOpenDay: (key: string) => void
}

export function MonthGrid({
  monthAnchor,
  direction,
  goal,
  sales,
  videos,
  products,
  dayViews,
  mode,
  isDark,
  onOpenDay,
}: Props) {
  const days = monthGridDays(monthAnchor)
  const monthKey = `${monthAnchor.getFullYear()}-${monthAnchor.getMonth()}-${mode}`

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAY_SHORT.map((w) => (
          <div
            key={w}
            className="py-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={monthKey}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-7 gap-1.5 sm:gap-2"
          >
            {days.map((d) => (
              <DayCell
                key={d.toISOString()}
                date={d}
                monthAnchor={monthAnchor}
                goal={goal}
                sales={sales}
                videos={videos}
                products={products}
                dayViews={dayViews}
                mode={mode}
                isDark={isDark}
                onOpen={onOpenDay}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
