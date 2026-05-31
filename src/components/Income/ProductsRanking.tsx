import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import type { ProductRankRow } from '../../lib/calculations'
import { BlurImage } from '../ui/BlurImage'
import { eur, num } from '../../lib/format'

export function ProductsRanking({ rows }: { rows: ProductRankRow[] }) {
  const navigate = useNavigate()
  const maxGmv = Math.max(...rows.map((r) => r.gmv), 1)

  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => {
        const widthPct = (r.gmv / maxGmv) * 100
        const isTop = i === 0
        return (
          <motion.button
            key={r.product.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ x: 2 }}
            onClick={() => navigate(`/productos/${r.product.id}`)}
            className="relative w-full overflow-hidden rounded-2xl surface p-3 text-left transition-shadow hover:shadow-soft-lg sm:p-4"
          >
            {/* Barra de progreso GMV de fondo */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 bg-brand/[0.06] dark:bg-brand/[0.10]"
              style={{ width: `${widthPct}%` }}
            />

            <div className="relative flex items-center gap-3">
              {/* Posición */}
              <div className="flex shrink-0 flex-col items-center justify-center">
                {isTop ? (
                  <Crown size={20} className="text-st-testeando drop-shadow" />
                ) : (
                  <span className="text-base font-bold tnum text-muted">
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Imagen */}
              <BlurImage
                src={r.product.image_url}
                className="h-12 w-12 shrink-0 rounded-xl sm:h-14 sm:w-14"
              />

              {/* Nombre y % del total */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold sm:text-base">
                  {r.product.name}
                </div>
                <div className="mt-0.5 text-xs text-muted tnum">
                  {num(r.units)} {r.units === 1 ? 'unidad vendida' : 'unidades vendidas'}
                </div>
              </div>

              {/* GMV + comisión */}
              <div className="shrink-0 text-right">
                <div className="text-base font-bold tnum text-brand sm:text-lg">
                  {eur(r.gmv)}
                </div>
                <div className="text-xs font-medium tnum text-accent">
                  {eur(r.commission)} de comisión
                </div>
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
