import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Coins, Film, Package, Pencil, TrendingUp, Trash2 } from 'lucide-react'
import { ProductForm } from '../components/Products/ProductForm'
import { StatusBadge } from '../components/Products/StatusBadge'
import { StatusPicker } from '../components/Products/StatusPicker'
import { BlurImage } from '../components/ui/BlurImage'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { useData } from '../hooks/useData'
import { productTotals } from '../lib/calculations'
import { eur, num, pct } from '../lib/format'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { products, sales, videos, updateProduct, deleteProduct, loading } = useData()

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const product = products.find((p) => p.id === id)

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-black/[0.05] dark:bg-white/[0.05]" />
  }

  if (!product) {
    return (
      <EmptyState
        icon={<Package size={22} />}
        title="Producto no encontrado"
        action={<Button onClick={() => navigate('/productos')}>Volver a productos</Button>}
      />
    )
  }

  const totals = productTotals(product.id, sales, videos, products)

  const kpis = [
    { label: 'GMV total', value: eur(totals.gmv), icon: TrendingUp, accent: 'text-brand' },
    { label: 'Comisión total', value: eur(totals.commission), icon: Coins, accent: 'text-accent' },
    { label: 'Unidades totales', value: num(totals.units), icon: Package },
    { label: 'Vídeos hechos', value: num(totals.videos), icon: Film },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Atrás
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil size={15} /> Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={15} className="text-st-descartado" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl surface">
        <BlurImage src={product.image_url} className="aspect-[16/9] w-full" />
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <button onClick={() => setStatusOpen(true)} className="transition-transform hover:scale-105">
              <StatusBadge status={product.status} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted tnum">
            <span>Comisión {pct(product.commission_pct)}</span>
            <span className="opacity-40">·</span>
            <span>Precio {eur(product.price)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="surface rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted">{k.label}</span>
              <k.icon size={16} className="text-muted" />
            </div>
            <div className={`text-2xl font-bold tnum ${k.accent ?? ''}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <ProductForm open={editOpen} onClose={() => setEditOpen(false)} product={product} />

      <Modal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="Cambiar estado"
        size="sm"
      >
        <StatusPicker
          value={product.status}
          onChange={(s) => {
            updateProduct(product.id, { status: s })
            setStatusOpen(false)
          }}
        />
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminar producto"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteProduct(product.id)
                navigate('/productos')
              }}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          ¿Seguro que quieres eliminar <strong>{product.name}</strong>? Se borrarán
          también sus ventas asociadas. Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  )
}
