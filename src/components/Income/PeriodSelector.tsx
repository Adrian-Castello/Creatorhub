import type { Period } from '../../lib/types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'custom', label: 'Personalizado' },
]

interface Props {
  period: Period
  onPeriod: (p: Period) => void
  compare: boolean
  onCompare: (v: boolean) => void
}

export function PeriodSelector({ period, onPeriod, compare, onCompare }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-xl surface p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriod(p.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              period === p.value
                ? 'bg-brand text-white'
                : 'text-sub dark:text-d-sub hover:text-ink dark:hover:text-d-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <button
          onClick={() => onCompare(!compare)}
          role="switch"
          aria-checked={compare}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            compare ? 'bg-brand' : 'bg-black/15 dark:bg-white/15'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              compare ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className="text-muted">Comparar con período anterior</span>
      </label>
    </div>
  )
}
