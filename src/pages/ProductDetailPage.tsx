import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Coins, Eye, Film, Package, Pencil, ShoppingBag, TrendingUp, Trash2 } from 'lucide-react'
import { ProductForm } from '../components/Products/ProductForm'
import { StatusPicker } from '../components/Products/StatusPicker'
import { BlurImage } from '../components/ui/BlurImage'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { useData } from '../hooks/useData'
import { useThemeContext } from '../hooks/themeContext'
import { productTotals, productViews } from '../lib/calculations'
import { STATUS_COLORS, STATUS_LABELS, STATUS_TINTS } from '../lib/constants'
import { eur, num, pct } from '../lib/format'

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

  const tint = STATUS_TINTS[product.status]
  const bg = isDark ? tint.darkBg : tint.lightBg
  const statusColor = STATUS_COLORS[product.status]

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
        className="overflow-hidden rounded-2xl"
        style={{ borderColor: statusColor, borderWidth: '2px', borderStyle: 'solid' }}
      >
        <BlurImage src={product.image_url} className="aspect-[16/9] w-full" />
        <div className="p-5" style={{ backgroundColor: bg }}>
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 flex-1 text-2xl font-bold tracking-tight">
              {product.name}
            </h1>
            <button
              onClick={() => setStatusOpen(true)}
              title="Cambiar estado"
              className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-all hover:scale-105"
              style={{ backgroundColor: statusColor, color: 'white' }}
            >
              {STATUS_LABELS[product.status]}
            </button>
          </div>
          <div className="mt-2 text-sm text-muted tnum">
            Comisión {pct(product.commission_pct)}
          </div>
        </div>
      </div>

      {/* 3 secciones grandes: Ventas, Views, Comisión */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <BigStat label="Ventas" value={num(totals.units)} icon={ShoppingBag} />
        <BigStat label="Views" value={num(views)} icon={Eye} />
        <BigStat
          label="Comisión"
          value={eur(totals.commission)}
          icon={Coins}
          accent="text-accent"
        />
      </div>

      {/* KPIs secundarios */}
      <div className="grid grid-cols-2 gap-3">
        <div className="surface rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">GMV total</span>
            <TrendingUp size={16} className="text-muted" />
          </div>
          <div className="text-2xl font-bold tnum text-brand">{eur(totals.gmv)}</div>
        </div>
        <div className="surface rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Vídeos hechos</span>
            <Film size={16} className="text-muted" />
          </div>
          <div className="text-2xl font-bold tnum">{num(totals.videos)}</div>
        </div>
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

function BigStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: any
  accent?: string
}) {
  return (
    <div className="surface rounded-2xl p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </span>
        <Icon size={18} className="text-muted" />
      </div>
      <div className={`text-3xl font-bold tnum ${accent ?? ''}`}>{value}</div>
    </div>
  )
}
