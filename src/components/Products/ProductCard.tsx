import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Product, Sale, Video } from '../../lib/types'
import { BlurImage } from '../ui/BlurImage'
import { STATUS_TINTS } from '../../lib/constants'
import { useThemeContext } from '../../hooks/themeContext'
import { pct } from '../../lib/format'

interface Props {
  product: Product
  sales: Sale[]
  videos: Video[]
  products: Product[]
}

export function ProductCard({ product }: Props) {
  const navigate = useNavigate()
  const { isDark } = useThemeContext()
  const tint = STATUS_TINTS[product.status]
  const bg = isDark ? tint.darkBg : tint.lightBg
  const border = isDark ? tint.darkBorder : tint.lightBorder

  return (
    <motion.button
      layout
      onClick={() => navigate(`/productos/${product.id}`)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      style={{ backgroundColor: bg, borderColor: border }}
      className="group flex flex-col overflow-hidden rounded-2xl border text-left transition-shadow hover:shadow-soft-lg"
    >
      <BlurImage src={product.image_url} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {product.name}
        </h3>
        <div className="mt-1 text-xs text-muted tnum">
          {pct(product.commission_pct)} de comisión
        </div>
      </div>
    </motion.button>
  )
}
