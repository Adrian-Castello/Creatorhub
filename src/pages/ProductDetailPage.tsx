import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Coins, Eye, Film, Flame, Package, Pencil, TrendingUp, Trash2 } from 'lucide-react'
import { ProductForm } from '../components/Products/ProductForm'
import { StatusPicker } from '../components/Products/StatusPicker'
import { BlurImage } from '../components/ui/BlurImage'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { useData } from '../hooks/useData'
import { useThemeContext } from '../hooks/themeContext'
import { productTotals, productViews, productViralDays } from '../lib/calculations'
import { STATUS_TINTS, STATUS_LABELS } from '../lib/constants'
import { eur, num, pct } from '../lib/format'

const VIRAL_THRESHOLD = 100_000

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { products, sales, videos, dayViews, updateProduct, deleteProduct, loading } = useData()
  const { isDark } = useThemeContext()

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
  const views = productViews(product.id, dayViews)
  const viral = productViralDays(product.id, dayViews, VIRAL_THRESHOLD)

  const tint = STATUS_TINTS[product.status]
  const bg = isDark ? tint.darkBg : tint.lightBg
  const border = isDark ? tint.darkBorder : tint.lightBorder

  const kpis = [
    { label: 'GMV total', value: eur(totals.gmv), icon: TrendingUp, accent: 'text-brand' },
    { label: 'Comisión', value: eur(totals.commission), icon: Coins, accent: 'text-accent' },
    { label: 'Unidades vendidas', value: num(totals.units), icon: Package },
    { label: 'Vídeos hechos', value: num(totals.videos), icon: Film },
    { label: 'Visualizaciones', value: num(views), icon: Eye },
    {
      label: 'Vídeos virales',
      value: num(viral),
      icon: Flame,
      sub: `+${(VIRAL_THRESHOLD / 1000).toFixed(0)}k visualizaciones`,
    },
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

      <div
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: border }}
      >
        <BlurImage src={product.image_url} className="aspect-[16/9] w-full" />
        <div
          className="p-5"
          style={{ backgroundColor: bg }}
        >
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted tnum">
            <span>Comisión {pct(product.commission_pct)}</span>
            <span className="opacity-40">·</span>
            <span>Precio {eur(product.price)}</span>
            <button
              onClick={() => setStatusOpen(true)}
              className="ml-auto rounded-full px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:text-ink dark:hover:text-d-ink"
              title="Cambiar estado"
            >
              {STATUS_LABELS[product.status]}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="surface rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted">{k.label}</span>
              <k.icon size={16} className="text-muted" />
            </div>
            <div className={`text-2xl font-bold tnum ${k.accent ?? ''}`}>{k.value}</div>
            {k.sub && (
              <div className="mt-0.5 text-xs text-muted">{k.sub}</div>
            )}
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
