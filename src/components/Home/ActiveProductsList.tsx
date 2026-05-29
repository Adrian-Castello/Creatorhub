import { useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { StatusBadge } from '../Products/StatusBadge'
import { BlurImage } from '../ui/BlurImage'
import { EmptyState } from '../ui/EmptyState'
import { todayKey } from '../../lib/dates'
import { eur } from '../../lib/format'

export function ActiveProductsList() {
  const { products, sales } = useData()
  const navigate = useNavigate()
  const key = todayKey()

  const visible = products.filter(
    (p) => p.status === 'activo' || p.status === 'testeando',
  )

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={<Package size={22} />}
        title="Sin productos activos"
        description="Marca productos como activos o en testeo para verlos aquí."
      />
    )
  }

  return (
    <div className="space-y-2">
      {visible.map((p) => {
        const todaySales = sales.filter(
          (s) => s.day_date === key && s.product_id === p.id,
        )
        const units = todaySales.reduce((a, s) => a + s.units, 0)
        const gmv = todaySales.reduce((a, s) => a + s.gmv, 0)
        return (
          <button
            key={p.id}
            onClick={() => navigate(`/productos/${p.id}`)}
            className="flex w-full items-center gap-3 rounded-xl surface p-2.5 text-left transition-colors hover:border-brand/40"
          >
            <BlurImage src={p.image_url} className="h-11 w-11 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{p.name}</span>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-0.5 text-xs text-muted tnum">
                Hoy: {units} uds · {eur(gmv)}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
