import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { RangeTotals } from '../../lib/calculations'
import { pctDelta } from '../../lib/calculations'
import { eur, num, signedPct } from '../../lib/format'

interface Props {
  current: RangeTotals
  previous: RangeTotals | null
  /** Solo los bonus (premios en metálico) se suman a "Ingresos totales".
   *  Los cupones se quedan fuera porque no son retirables. */
  bonusTotal: number
  prevBonusTotal: number
}

export function IncomeKpis({ current, previous, bonusTotal, prevBonusTotal }: Props) {
  // "Ingresos totales" = comisión productos + bonus (cupones excluidos)
  const totalIncome = current.commission + bonusTotal
  const prevTotalIncome = previous ? previous.commission + prevBonusTotal : 0

  const items = [
    { label: 'GMV total', value: eur(current.gmv), cur: current.gmv, prev: previous?.gmv, accent: 'text-brand', isCurrency: true },
    { label: 'Ingresos totales', value: eur(totalIncome), cur: totalIncome, prev: previous ? prevTotalIncome : undefined, accent: 'text-accent', isCurrency: true },
    { label: 'Ventas totales', value: num(current.units), cur: current.units, prev: previous?.units, isCurrency: false },
    { label: 'Publicaciones subidas', value: num(current.videos), cur: current.videos, prev: previous?.videos, isCurrency: false },
  ]

  // ¿Hay datos en el período anterior? (si todo está a 0, lo consideramos vacío)
  const hasPrevData = previous
    ? previous.gmv > 0 || previous.commission > 0 || previous.units > 0 || previous.videos > 0 || prevBonusTotal > 0
    : false

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((it, i) => {
        const delta = previous ? pctDelta(it.cur, it.prev ?? 0) : null
        const up = (delta ?? 0) >= 0
        return (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="surface rounded-2xl p-4"
          >
            <div className="text-xs font-medium text-muted">{it.label}</div>
            <div className={`mt-1 text-2xl font-bold tnum ${it.accent ?? ''}`}>
              {it.value}
            </div>
            {previous && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                {!hasPrevData ? (
                  <span className="truncate text-muted">Sin registros anteriores</span>
                ) : delta === null ? (
                  <span className="text-muted">—</span>
                ) : (
                  <>
                    <span
                      className={`flex items-center gap-0.5 font-medium ${
                        up ? 'text-st-activo' : 'text-st-descartado'
                      }`}
                    >
                      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {signedPct(delta)}
                    </span>
                    <span className="text-muted tnum">
                      {it.isCurrency ? eur(it.prev ?? 0) : num(it.prev ?? 0)}
                    </span>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
