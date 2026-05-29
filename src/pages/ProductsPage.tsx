import { useMemo, useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { ProductGrid } from '../components/Products/ProductGrid'
import { ProductForm } from '../components/Products/ProductForm'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useData } from '../hooks/useData'
import { STATUS_LABELS } from '../lib/constants'
import type { ProductStatus } from '../lib/types'

type Filter = 'todos' | ProductStatus

const FILTERS: Filter[] = ['todos', 'nuevo', 'testeando', 'activo', 'pausado', 'descartado']

export function ProductsPage() {
  const { products, sales, videos, loading } = useData()
  const [filter, setFilter] = useState<Filter>('todos')
  const [includeDiscarded, setIncludeDiscarded] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const activeCount = products.filter((p) => p.status === 'activo').length

  const visible = useMemo(() => {
    let list = products
    if (filter === 'todos') {
      if (!includeDiscarded) list = list.filter((p) => p.status !== 'descartado')
    } else {
      list = list.filter((p) => p.status === filter)
    }
    return list
  }, [products, filter, includeDiscarded])

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-muted tnum">
            {products.length} productos · {activeCount} activos
          </p>
        </div>
        <Button className="hidden sm:inline-flex" onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Nuevo producto
        </Button>
      </header>

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
            {f === 'todos' ? 'Todos' : STATUS_LABELS[f]}
          </button>
        ))}
        {filter === 'todos' && (
          <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-xs text-muted">
            <input
              type="checkbox"
              checked={includeDiscarded}
              onChange={(e) => setIncludeDiscarded(e.target.checked)}
              className="accent-brand"
            />
            Incluir descartados
          </label>
        )}
      </div>

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
