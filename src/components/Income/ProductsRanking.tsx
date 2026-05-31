import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import type { ProductRankRow } from '../../lib/calculations'
import { BlurImage } from '../ui/BlurImage'
import { eur, num } from '../../lib/format'

// Colores top: 1=oro, 2=plata, 3=bronce, 4-10=marca, 11+=neutro
function rankTone(i: number): { bar: string; barAlpha: string } {
  if (i === 0) return { bar: '#FACC15', barAlpha: 'rgba(250, 204, 21, 0.10)' } // oro
  if (i === 1) return { bar: '#94A3B8', barAlpha: 'rgba(148, 163, 184, 0.10)' } // plata
  if (i === 2) return { bar: '#B45309', barAlpha: 'rgba(180, 83, 9, 0.10)' } // bronce
  if (i < 10) return { bar: '#8B5CF6', barAlpha: 'rgba(139, 92, 246, 0.06)' } // marca
  return { bar: '#6B7280', barAlpha: 'rgba(107, 114, 128, 0.04)' } // neutro
}

export function ProductsRanking({ rows }: { rows: ProductRankRow[] }) {
  const navigate = useNavigate()
  const maxGmv = Math.max(...rows.map((r) => r.gmv), 1)

  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => {
        const widthPct = (r.gmv / maxGmv) * 100
        const isTop = i === 0
        const tone = rankTone(i)
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
            {/* Barra de progreso (color top según posición) */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0"
              style={{ width: `${widthPct}%`, backgroundColor: tone.barAlpha }}
            />

            <div className="relative flex items-center gap-3">
              {/* Posición — mismo tamaño para # y corona */}
              <div className="flex w-6 shrink-0 items-center justify-center text-base font-bold tnum">
                {isTop ? (
                  <Crown size={18} style={{ color: tone.bar }} />
                ) : (
                  <span style={{ color: tone.bar }}>{i + 1}</span>
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
                  {num(r.units)} unidades
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
