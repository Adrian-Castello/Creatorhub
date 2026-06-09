import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import type { ProductRankRow } from '../../lib/calculations'
import { BlurImage } from '../ui/BlurImage'
import { eur, num } from '../../lib/format'

// Top 3 = oro / plata / bronce con corona del mismo color
// Top 4+ = numero en color neutro gris-tipográfico
function rankColor(i: number): string {
  if (i === 0) return '#FACC15' // oro
  if (i === 1) return '#94A3B8' // plata
  if (i === 2) return '#B45309' // bronce
  return '#9CA3AF'              // neutro (gris medio)
}

export function ProductsRanking({ rows }: { rows: ProductRankRow[] }) {
  const navigate = useNavigate()

  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => {
        const color = rankColor(i)
        const isTopThree = i < 3
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
            <div className="flex items-center gap-3">
              {/* Posición — top3 corona del color, resto número neutro */}
              <div className="flex w-7 shrink-0 items-center justify-center text-base font-bold tnum">
                {isTopThree ? (
                  <Crown
                    size={20}
                    style={{
                      color,
                      filter: `drop-shadow(0 1px 2px ${color}66)`,
                    }}
                    fill={color}
                  />
                ) : (
                  <span style={{ color }}>{i + 1}</span>
                )}
              </div>

              {/* Imagen */}
              <BlurImage
                src={r.product.image_url}
                className="h-12 w-12 shrink-0 rounded-xl sm:h-14 sm:w-14"
              />

              {/* Nombre y unidades */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold sm:text-base">
                  {r.product.name}
                </div>
                <div className="mt-0.5 text-xs text-muted tnum">
                  {num(r.units)} {r.units === 1 ? 'venta' : 'ventas'}
                </div>
              </div>

              {/* GMV + comisión (solo número, sin texto) */}
              <div className="shrink-0 text-right">
                <div className="text-base font-bold tnum text-brand sm:text-lg">
                  {eur(r.gmv)}
                </div>
                <div className="text-xs font-medium tnum text-accent">
                  {eur(r.commission)}
                </div>
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
