import type { Period } from '../../lib/types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Anual' },
]

interface Props {
  period: Period
  onPeriod: (p: Period) => void
  compare: boolean
  onCompare: (v: boolean) => void
}

export function PeriodSelector({ period, onPeriod, compare, onCompare }: Props) {
  const compareLabel =
    period === 'day' ? 'Comparar con el día anterior'
    : period === 'week' ? 'Comparar con la semana anterior'
    : period === 'month' ? 'Comparar con el mes anterior'
    : period === 'year' ? 'Comparar con el año anterior'
    : 'Comparar con el período anterior' // custom

  return (
    <div className="space-y-3">
      {/* Línea 1: 4 botones simétricos + Personalizar separado */}
      <div className="flex items-center gap-2">
        {/* Segmented control de 4 botones — ancho compartido */}
        <div className="flex flex-1 rounded-xl surface p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriod(p.value)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-all ${
                period === p.value
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-sub dark:text-d-sub hover:text-ink dark:hover:text-d-ink'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Personalizar — separado, con mismo alto que el segmented (h-10) */}
        <button
          onClick={() => onPeriod('custom')}
          className={`h-10 shrink-0 rounded-xl px-4 text-sm font-medium transition-all ${
            period === 'custom'
              ? 'bg-brand text-white shadow-sm'
              : 'surface text-sub dark:text-d-sub hover:border-brand/40 hover:text-ink dark:hover:text-d-ink'
          }`}
        >
          Personalizar
        </button>
      </div>

      {/* Línea 2: toggle de comparar (cuando aplica) */}
      {period !== 'custom' && (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <button
            onClick={() => onCompare(!compare)}
            role="switch"
            aria-checked={compare}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              compare ? 'bg-brand' : 'bg-black/15 dark:bg-white/15'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                compare ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-muted">{compareLabel}</span>
        </label>
      )}
    </div>
  )
}
