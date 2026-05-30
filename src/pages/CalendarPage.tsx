import { useMemo, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, ChevronLeft, ChevronRight, Eye, Film, TrendingUp, X } from 'lucide-react'
import { MonthGrid } from '../components/Calendar/MonthGrid'
import { DayModal } from '../components/Calendar/DayModal'
import type { CalendarMode } from '../components/Calendar/DayCell'
import { useData } from '../hooks/useData'
import { useThemeContext } from '../hooks/themeContext'
import {
  addMonths,
  endOfMonth,
  formatLongDate,
  formatMonthYear,
  fromKey,
  startOfMonth,
} from '../lib/dates'
import { dayTotals, rangeTotals } from '../lib/calculations'
import { eur, num } from '../lib/format'

const MODES: { value: CalendarMode; label: string }[] = [
  { value: 'publicaciones', label: 'Publicaciones' },
  { value: 'monetizacion', label: 'Monetización' },
]

export function CalendarPage() {
  const { sales, videos, products, dayViews, settings } = useData()
  const { isDark } = useThemeContext()

  const [anchor, setAnchor] = useState(() => new Date())
  const [direction, setDirection] = useState(0)
  const [mode, setMode] = useState<CalendarMode>('publicaciones')
  const [dayKey, setDayKey] = useState<string | null>(null)        // modal abierto
  const [previewKey, setPreviewKey] = useState<string | null>(null) // panel inline
  const clickRef = useRef<{ key: string; t: number } | null>(null)

  const monthRange = useMemo(
    () => ({ from: startOfMonth(anchor), to: endOfMonth(anchor) }),
    [anchor],
  )
  const totals = rangeTotals(sales, videos, products, monthRange)

  function go(delta: number) {
    setDirection(delta)
    setAnchor((a) => addMonths(a, delta))
  }

  // Click vs doble-click: si dos clics en <350ms sobre el mismo día -> modal
  function handleCellClick(key: string) {
    const now = Date.now()
    const prev = clickRef.current
    if (prev && prev.key === key && now - prev.t < 350) {
      // doble clic -> abrir modal
      clickRef.current = null
      setDayKey(key)
      return
    }
    clickRef.current = { key, t: now }
    setPreviewKey((cur) => (cur === key ? null : key))
  }

  // Datos del día seleccionado para el panel inline
  const previewData = useMemo(() => {
    if (!previewKey) return null
    const t = dayTotals(previewKey, sales, products, videos)
    const views = dayViews
      .filter((v) => v.day_date === previewKey)
      .reduce((a, v) => a + v.views, 0)
    return { ...t, views }
  }, [previewKey, sales, products, videos, dayViews])

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
          <button
            onClick={() => {
              setDirection(0)
              setAnchor(new Date())
            }}
            aria-label="Volver al mes actual"
            title="Volver al mes actual"
            className="flex h-9 w-9 items-center justify-center rounded-xl surface text-brand transition-all hover:border-brand/40 hover:scale-105"
          >
            <CalendarCheck size={18} />
          </button>
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

      {/* Tabs Publicaciones / Monetización */}
      <div className="flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === m.value
                ? 'bg-brand text-white'
                : 'surface text-sub dark:text-d-sub hover:border-brand/40'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <MonthGrid
        monthAnchor={anchor}
        direction={direction}
        goal={settings.daily_video_goal}
        sales={sales}
        videos={videos}
        products={products}
        dayViews={dayViews}
        mode={mode}
        isDark={isDark}
        onOpenDay={handleCellClick}
      />

      {/* Panel inline al clicar un día */}
      <AnimatePresence>
        {previewData && previewKey && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="surface rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted">
                    Detalle del día
                  </div>
                  <div className="text-base font-semibold capitalize">
                    {formatLongDate(fromKey(previewKey))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setDayKey(previewKey)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
                  >
                    Editar día
                  </button>
                  <button
                    onClick={() => setPreviewKey(null)}
                    aria-label="Cerrar"
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Vídeos" value={num(previewData.videos)} icon={Film} />
                <Stat
                  label="Visualizaciones"
                  value={num(previewData.views)}
                  icon={Eye}
                />
                <Stat
                  label="GMV"
                  value={eur(previewData.gmv)}
                  icon={TrendingUp}
                  accent="text-brand"
                />
                <Stat
                  label="Comisión"
                  value={eur(previewData.commission)}
                  icon={TrendingUp}
                  accent="text-accent"
                />
              </div>
              <p className="mt-3 text-[11px] text-muted">
                Doble clic en cualquier día para abrir directamente.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DayModal
        open={dayKey !== null}
        dayKey={dayKey}
        onClose={() => setDayKey(null)}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: any
  accent?: string
}) {
  return (
    <div className="rounded-xl border hairline p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
        <Icon size={14} className="text-muted" />
      </div>
      <div className={`text-lg font-bold tnum ${accent ?? ''}`}>{value}</div>
    </div>
  )
}
