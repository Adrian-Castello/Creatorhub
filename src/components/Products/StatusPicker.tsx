import type { ProductStatus } from '../../lib/types'
import { STATUSES, STATUS_COLORS, STATUS_LABELS } from '../../lib/constants'

interface Props {
  value: ProductStatus
  onChange: (s: ProductStatus) => void
}

export function StatusPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => {
        const active = s === value
        const color = STATUS_COLORS[s]
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
            style={
              active
                ? { backgroundColor: color, color: '#fff' }
                : { backgroundColor: color + '1A', color }
            }
          >
            {STATUS_LABELS[s]}
          </button>
        )
      })}
    </div>
  )
}
