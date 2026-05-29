import type { ProductStatus } from '../../lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants'

export function StatusBadge({
  status,
  className = '',
}: {
  status: ProductStatus
  className?: string
}) {
  const color = STATUS_COLORS[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
      style={{
        backgroundColor: color + '22',
        color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {STATUS_LABELS[status]}
    </span>
  )
}

export function StatusDot({ status }: { status: ProductStatus }) {
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: STATUS_COLORS[status] }}
      title={STATUS_LABELS[status]}
    />
  )
}
