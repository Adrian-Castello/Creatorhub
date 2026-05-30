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
  const monthViews = useMemo(() => {
    return dayViews
      .filter((v) => {
        const d = fromKey(v.day_date)
        return d >= monthRange.from && d <= monthRange.to
      })
      .reduce((a, v) => a + v.views, 0)
  }, [dayViews, monthRange])

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

  const isCurrentMonth =
    anchor.getFullYear() === new Date().getFullYear() &&
    anchor.getMonth() === new Date().getMonth()

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {formatMonthYear(anchor)}
        </h1>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => go(-1)}
            aria-label="Mes anterior"
            className="flex h-9 w-9 items-center justify-center rounded-xl surface transition-colors hover:border-brand/40"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Mes siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-xl surface transition-colors hover:border-brand/40"
          >
            <ChevronRight size={18} />
          </button>
          {!isCurrentMonth && (
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
          )}
        </div>
      </header>

      {/* KPIs del mes */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile label="Vídeos" value={num(totals.videos)} />
        <KpiTile label="Visualizaciones" value={num(monthViews)} />
        <KpiTile label="GMV" value={eur(totals.gmv)} accent="text-brand" />
        <KpiTile label="Comisión" value={eur(totals.commission)} accent="text-accent" />
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

      {/* Segmented control Publicaciones / Monetización (debajo del calendario) */}
      <div className="flex w-full rounded-full surface p-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              mode === m.value
                ? 'bg-brand text-white shadow-sm'
                : 'text-sub dark:text-d-sub hover:text-ink dark:hover:text-d-ink'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

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

function KpiTile({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="surface rounded-2xl p-4">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className={`mt-1 text-xl font-bold tnum sm:text-2xl ${accent ?? ''}`}>
        {value}
      </div>
    </div>
  )
}
