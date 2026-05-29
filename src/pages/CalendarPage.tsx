import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthGrid } from '../components/Calendar/MonthGrid'
import { DayModal } from '../components/Calendar/DayModal'
import { Button } from '../components/ui/Button'
import { useData } from '../hooks/useData'
import { useThemeContext } from '../hooks/themeContext'
import {
  addMonths,
  endOfMonth,
  formatMonthYear,
  startOfMonth,
} from '../lib/dates'
import { rangeTotals } from '../lib/calculations'
import { eur, num } from '../lib/format'

export function CalendarPage() {
  const { sales, videos, products, settings } = useData()
  const { isDark } = useThemeContext()

  const [anchor, setAnchor] = useState(() => new Date())
  const [direction, setDirection] = useState(0)
  const [dayKey, setDayKey] = useState<string | null>(null)

  const monthRange = useMemo(
    () => ({ from: startOfMonth(anchor), to: endOfMonth(anchor) }),
    [anchor],
  )
  const totals = rangeTotals(sales, videos, products, monthRange)

  function go(delta: number) {
    setDirection(delta)
    setAnchor((a) => addMonths(a, delta))
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="min-w-[180px] text-2xl font-bold tracking-tight sm:text-3xl">
            {formatMonthYear(anchor)}
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => go(-1)}
              className="rounded-lg p-2 text-sub transition-colors hover:bg-black/5 dark:text-d-sub dark:hover:bg-white/5"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => go(1)}
              className="rounded-lg p-2 text-sub transition-colors hover:bg-black/5 dark:text-d-sub dark:hover:bg-white/5"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setDirection(0)
              setAnchor(new Date())
            }}
          >
            Hoy
          </Button>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <div>
            <div className="text-xs text-muted">Vídeos</div>
            <div className="font-semibold tnum">{num(totals.videos)}</div>
          </div>
          <div>
            <div className="text-xs text-muted">GMV</div>
            <div className="font-semibold tnum text-brand">{eur(totals.gmv)}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Comisión</div>
            <div className="font-semibold tnum text-accent">
              {eur(totals.commission)}
            </div>
          </div>
        </div>
      </header>

      <MonthGrid
        monthAnchor={anchor}
        direction={direction}
        goal={settings.daily_video_goal}
        sales={sales}
        videos={videos}
        products={products}
        isDark={isDark}
        onOpenDay={setDayKey}
      />

      <DayModal
        open={dayKey !== null}
        dayKey={dayKey}
        onClose={() => setDayKey(null)}
      />
    </div>
  )
}
