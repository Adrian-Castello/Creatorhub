import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import type { Product, Sale, Video } from '../../lib/types'
import { productTotals } from '../../lib/calculations'
import { StatusBadge } from './StatusBadge'
import { BlurImage } from '../ui/BlurImage'
import { eur, num, pct } from '../../lib/format'

interface Props {
  product: Product
  sales: Sale[]
  videos: Video[]
  products: Product[]
}

export function ProductCard({ product, sales, videos, products }: Props) {
  const navigate = useNavigate()
  const totals = productTotals(product.id, sales, videos, products)

  return (
    <motion.button
      layout
      onClick={() => navigate(`/productos/${product.id}`)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group flex flex-col overflow-hidden rounded-2xl surface text-left transition-shadow hover:shadow-soft-lg"
    >
      <div className="relative">
        <BlurImage src={product.image_url} className="aspect-[4/3] w-full" />
        <div className="absolute right-2 top-2">
          <StatusBadge status={product.status} className="backdrop-blur bg-card/80 dark:bg-d-card/80" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted tnum">
          <span>{pct(product.commission_pct)} com.</span>
          <span className="opacity-40">·</span>
          <span>{eur(product.price)}</span>
        </div>
        <div className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-muted tnum">
          <Package size={13} />
          <span>{num(totals.units)} uds</span>
          <span className="opacity-40">·</span>
          <span className="font-medium text-ink dark:text-d-ink">{eur(totals.gmv)}</span>
        </div>
      </div>
    </motion.button>
  )
}
