import { useMemo, useState, useRef } from 'react'
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [dayKey, setDayKey] = useState<string | null>(null)              // modal abierto
  const [selectedKey, setSelectedKey] = useState<string | null>(null)    // día con anillo / KPIs
  const clickRef = useRef<{ key: string; t: number } | null>(null)

  const isCurrentMonth =
    anchor.getFullYear() === new Date().getFullYear() &&
    anchor.getMonth() === new Date().getMonth()

  // Datos del mes (default)
  const monthRange = useMemo(
    () => ({ from: startOfMonth(anchor), to: endOfMonth(anchor) }),
    [anchor],
  )
  const monthTotals = rangeTotals(sales, videos, products, monthRange)
  const monthViews = useMemo(
    () =>
      dayViews
        .filter((v) => {
          const d = fromKey(v.day_date)
          return d >= monthRange.from && d <= monthRange.to
        })
        .reduce((a, v) => a + v.views, 0),
    [dayViews, monthRange],
  )

  // Datos del día seleccionado (overrides en los KPIs)
  const dayData = useMemo(() => {
    if (!selectedKey) return null
    const t = dayTotals(selectedKey, sales, products, videos)
    const v = dayViews
      .filter((x) => x.day_date === selectedKey)
      .reduce((a, x) => a + x.views, 0)
    return { ...t, views: v }
  }, [selectedKey, sales, products, videos, dayViews])

  // Mostrar en KPIs (mes o día)
  const showing = dayData
    ? {
        title: capitalize(formatLongDate(fromKey(selectedKey!))),
        videos: dayData.videos,
        views: dayData.views,
        gmv: dayData.gmv,
        commission: dayData.commission,
      }
    : {
        title: formatMonthYear(anchor),
        videos: monthTotals.videos,
        views: monthViews,
        gmv: monthTotals.gmv,
        commission: monthTotals.commission,
      }

  function go(delta: number) {
    setDirection(delta)
    setAnchor((a) => addMonths(a, delta))
    setSelectedKey(null) // al cambiar de mes, deseleccionar
  }

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
    // toggle: si vuelves a clicar el mismo día, deseleccionas
    setSelectedKey((cur) => (cur === key ? null : key))
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {showing.title}
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
                setSelectedKey(null)
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

      {/* KPIs: del mes por defecto, del día si hay uno seleccionado */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile label="Vídeos" value={num(showing.videos)} />
        <KpiTile label="Visualizaciones" value={num(showing.views)} />
        <KpiTile label="GMV" value={eur(showing.gmv)} accent="text-brand" />
        <KpiTile label="Comisión" value={eur(showing.commission)} accent="text-accent" />
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
        selectedKey={selectedKey}
        onOpenDay={handleCellClick}
      />

      {/* Segmented control Publicaciones / Monetización */}
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

      <DayModal
        open={dayKey !== null}
        dayKey={dayKey}
        onClose={() => setDayKey(null)}
      />
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
