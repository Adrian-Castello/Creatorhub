import { AnimatePresence } from 'framer-motion'
import type { Product, Sale, Video } from '../../lib/types'
import { ProductCard } from './ProductCard'

interface Props {
  products: Product[]
  allProducts: Product[]
  sales: Sale[]
  videos: Video[]
}

export function ProductGrid({ products, allProducts, sales, videos }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            products={allProducts}
            sales={sales}
            videos={videos}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
