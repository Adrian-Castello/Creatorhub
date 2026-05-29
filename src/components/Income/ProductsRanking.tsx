import { useNavigate } from 'react-router-dom'
import type { ProductRankRow } from '../../lib/calculations'
import { BlurImage } from '../ui/BlurImage'
import { eur, num, pct } from '../../lib/format'

export function ProductsRanking({ rows }: { rows: ProductRankRow[] }) {
  const navigate = useNavigate()

  return (
    <div className="surface overflow-hidden rounded-2xl">
      <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b hairline px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted sm:grid">
        <span>Producto</span>
        <span className="w-16 text-right">Uds</span>
        <span className="w-24 text-right">GMV</span>
        <span className="w-24 text-right">Comisión</span>
        <span className="w-16 text-right">% total</span>
      </div>

      <div className="divide-y hairline">
        {rows.map((r, i) => (
          <button
            key={r.product.id}
            onClick={() => navigate(`/productos/${r.product.id}`)}
            className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] sm:grid-cols-[1fr_auto_auto_auto_auto] sm:gap-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden w-4 text-sm font-semibold text-muted tnum sm:block">
                {i + 1}
              </span>
              <BlurImage src={r.product.image_url} className="h-9 w-9 shrink-0 rounded-lg" />
              <span className="truncate text-sm font-medium">{r.product.name}</span>
            </div>

            <div className="hidden w-16 text-right text-sm tnum sm:block">
              {num(r.units)}
            </div>
            <div className="text-right text-sm font-semibold tnum sm:w-24">
              {eur(r.gmv)}
            </div>
            <div className="hidden w-24 text-right text-sm tnum text-accent sm:block">
              {eur(r.commission)}
            </div>
            <div className="hidden w-16 text-right text-sm tnum text-muted sm:block">
              {pct(r.pctOfTotal)}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
