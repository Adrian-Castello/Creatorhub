import { toKey, fromKey } from '../../lib/dates'
import type { DateRange } from '../../lib/types'

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 surface rounded-xl px-3 h-10">
        <span className="text-xs text-muted">Desde</span>
        <input
          type="date"
          value={toKey(value.from)}
          max={toKey(value.to)}
          onChange={(e) =>
            e.target.value &&
            onChange({ ...value, from: fromKey(e.target.value) })
          }
          className="bg-transparent text-sm outline-none tnum"
        />
      </div>
      <div className="flex items-center gap-2 surface rounded-xl px-3 h-10">
        <span className="text-xs text-muted">Hasta</span>
        <input
          type="date"
          value={toKey(value.to)}
          min={toKey(value.from)}
          onChange={(e) =>
            e.target.value &&
            onChange({ ...value, to: fromKey(e.target.value) })
          }
          className="bg-transparent text-sm outline-none tnum"
        />
      </div>
    </div>
  )
}
