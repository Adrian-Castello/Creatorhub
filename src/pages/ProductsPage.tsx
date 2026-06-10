import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Layers, Package, Plus } from 'lucide-react'
import { ProductGrid } from '../components/Products/ProductGrid'
import { ProductForm } from '../components/Products/ProductForm'
import { Dropdown } from '../components/ui/Dropdown'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useData } from '../hooks/useData'
import { STATUS_COLORS } from '../lib/constants'
import { num } from '../lib/format'
import type { ProductStatus } from '../lib/types'

type Filter = 'todos' | ProductStatus

const FILTER_OPTIONS: { value: Filter; label: string; color?: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'carruseles', label: 'Carruseles', color: STATUS_COLORS.carruseles },
  { value: 'solicitado', label: 'Solicitados', color: STATUS_COLORS.solicitado },
  { value: 'recibido', label: 'Recibidos', color: STATUS_COLORS.recibido },
  { value: 'muestra', label: 'Muestras', color: STATUS_COLORS.muestra },
  { value: 'testeando', label: 'Testeos', color: STATUS_COLORS.testeando },
  { value: 'activo', label: 'Activos', color: STATUS_COLORS.activo },
  { value: 'descartado', label: 'Descartados', color: STATUS_COLORS.descartado },
]

export function ProductsPage() {
  const { products, sales, videos, loading } = useData()
  const [filter, setFilter] = useState<Filter>(() => {
    if (typeof window === 'undefined') return 'todos'
    const saved = window.sessionStorage.getItem('products:filter')
    if (saved && FILTER_OPTIONS.some((o) => o.value === saved)) {
      return saved as Filter
    }
    return 'todos'
  })

  // Persistir el filtro entre navegaciones (vuelta desde detalle)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('products:filter', filter)
    }
  }, [filter])
  const [formOpen, setFormOpen] = useState(false)

  // Métricas
  const activeFlow = products.filter(
    (p) => p.status === 'recibido' || p.status === 'testeando' || p.status === 'activo',
  ).length
  const totalProducts = products.length

  // Listado con orden lógico de fase
  const orderedStatus: ProductStatus[] = ['solicitado', 'recibido', 'testeando', 'activo', 'descartado']
  const visible = useMemo(() => {
    if (filter === 'todos') {
      // En "Todos" no mostramos descartados (van bajo su propio filtro)
      return [...products]
        .filter((p) => p.status !== 'descartado')
        .sort((a, b) => orderedStatus.indexOf(a.status) - orderedStatus.indexOf(b.status))
    }
    return products.filter((p) => p.status === filter)
  }, [products, filter])

  return (
    <div className="space-y-5">
      {/* Header con título a la izq, métricas en medio, FAB+filtro a la dcha */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Productos</h1>
        </div>

        <div className="flex items-center gap-2">
          <Dropdown
            value={filter}
            options={FILTER_OPTIONS}
            onChange={setFilter}
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setFormOpen(true)}
            aria-label="Nuevo producto"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm transition-all hover:bg-brand-light hover:shadow-glow"
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </header>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface rounded-2xl p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Productos activos</span>
            <Layers size={16} className="text-muted" />
          </div>
          <div className="text-2xl font-bold tnum text-brand">{num(activeFlow)}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="surface rounded-2xl p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Productos totales</span>
            <FlaskConical size={16} className="text-muted" />
          </div>
          <div className="text-2xl font-bold tnum text-accent">{num(totalProducts)}</div>
        </motion.div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Package size={22} />}
          title="No hay productos"
          description={
            products.length === 0
              ? 'Crea tu primer producto para empezar a trackear publicaciones y ventas.'
              : 'Ningún producto coincide con este filtro.'
          }
        />
      ) : (
        <ProductGrid
          products={visible}
          allProducts={products}
          sales={sales}
          videos={videos}
        />
      )}

      <ProductForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
