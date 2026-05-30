import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, FlaskConical, Layers, Package, Plus } from 'lucide-react'
import { ProductGrid } from '../components/Products/ProductGrid'
import { ProductForm } from '../components/Products/ProductForm'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useData } from '../hooks/useData'
import { STATUS_LABELS } from '../lib/constants'
import { num } from '../lib/format'
import type { ProductStatus } from '../lib/types'

type Filter = 'todos' | Exclude<ProductStatus, 'descartado'>

const FILTERS: Filter[] = ['todos', 'solicitado', 'recibido', 'testeando', 'activo']

export function ProductsPage() {
  const { products, sales, videos, loading } = useData()
  const [filter, setFilter] = useState<Filter>('todos')
  const [showCompleted, setShowCompleted] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  // Métricas arriba
  const activeFlow = products.filter(
    (p) => p.status === 'recibido' || p.status === 'testeando' || p.status === 'activo',
  ).length
  const tested = products.filter(
    (p) => p.status === 'testeando' || p.status === 'descartado',
  ).length

  // Listados
  const activeProducts = useMemo(() => {
    const base = products.filter((p) => p.status !== 'descartado')
    if (filter === 'todos') return base
    return base.filter((p) => p.status === filter)
  }, [products, filter])

  const discardedProducts = useMemo(
    () => products.filter((p) => p.status === 'descartado'),
    [products],
  )

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-muted tnum">
            {products.length} en total
          </p>
        </div>
        <Button className="hidden sm:inline-flex" onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Nuevo producto
        </Button>
      </header>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="surface rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">En curso</span>
            <Layers size={16} className="text-muted" />
          </div>
          <div className="text-2xl font-bold tnum text-brand">{num(activeFlow)}</div>
          <div className="mt-0.5 text-xs text-muted">Recibido + Testeando + Activo</div>
        </div>
        <div className="surface rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Testeados en total</span>
            <FlaskConical size={16} className="text-muted" />
          </div>
          <div className="text-2xl font-bold tnum text-accent">{num(tested)}</div>
          <div className="mt-0.5 text-xs text-muted">Testeando + Descartado</div>
        </div>
      </div>

      {/* Filtros (sin Descartado) */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-brand text-white'
                : 'surface text-sub dark:text-d-sub hover:border-brand/40'
            }`}
          >
            {f === 'todos' ? 'Todos' : STATUS_LABELS[f as ProductStatus]}
          </button>
        ))}
      </div>

      {/* Grid activos */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : activeProducts.length === 0 ? (
        <EmptyState
          icon={<Package size={22} />}
          title="No hay productos"
          description={
            products.length === 0
              ? 'Crea tu primer producto para empezar a trackear vídeos y ventas.'
              : 'Ningún producto coincide con este filtro.'
          }
          action={
            products.length === 0 ? (
              <Button onClick={() => setFormOpen(true)}>
                <Plus size={16} /> Nuevo producto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ProductGrid
          products={activeProducts}
          allProducts={products}
          sales={sales}
          videos={videos}
        />
      )}

      {/* Sección Completadas (descartados) */}
      {discardedProducts.length > 0 && (
        <section className="surface rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
          >
            <span className="text-sm font-semibold">
              Completadas ({discardedProducts.length})
            </span>
            <motion.span
              animate={{ rotate: showCompleted ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted"
            >
              <ChevronDown size={18} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="border-t hairline p-4">
                  <ProductGrid
                    products={discardedProducts}
                    allProducts={products}
                    sales={sales}
                    videos={videos}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      <ProductForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
