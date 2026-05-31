import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Award, Coins, Eye, Film, Package, Pencil, ShoppingBag, TrendingUp, Trash2 } from 'lucide-react'
import { ProductForm } from '../components/Products/ProductForm'
import { StatusPicker } from '../components/Products/StatusPicker'
import { BlurImage } from '../components/ui/BlurImage'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { useData } from '../hooks/useData'
import { useThemeContext } from '../hooks/themeContext'
import { productTotals, productViews } from '../lib/calculations'
import { PRODUCT_TIERS, productTier, STATUS_COLORS, STATUS_LABELS, STATUS_TINTS } from '../lib/constants'
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
  const tier = productTier(totals.gmv, views)

  const tint = STATUS_TINTS[product.status]
  const bg = isDark ? tint.darkBg : tint.lightBg
  const statusColor = STATUS_COLORS[product.status]
  const statusBgChip = isDark ? `${statusColor}33` : `${statusColor}1A` // 20%/10% alpha hex
  const statusFgChip = statusColor

  // Tier visualización
  const tierBg = tier
    ? (isDark ? tier.tier.bg.dark : tier.tier.bg.light)
    : isDark ? '#1F2024' : '#F3F4F6'
  const tierFg = tier
    ? (isDark ? tier.tier.fg.dark : tier.tier.fg.light)
    : isDark ? '#6B7280' : '#9CA3AF'

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

      <div>
        <div className="overflow-hidden rounded-2xl">
          <BlurImage src={product.image_url} className="aspect-[16/9] w-full" />
        </div>
        <div
          className="-mt-3 rounded-2xl p-5"
          style={{
            backgroundColor: bg,
            border: `2px solid ${statusColor}`,
          }}
        >
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="text-sm text-muted tnum">
              Comisión {pct(product.commission_pct)}
            </div>
            <button
              onClick={() => setStatusOpen(true)}
              title="Cambiar estado"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: statusBgChip, color: statusFgChip }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
              {STATUS_LABELS[product.status]}
            </button>
          </div>
        </div>
      </div>

      {/* 6 KPIs en rejilla simétrica 2×3 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Ventas" value={num(totals.units)} icon={ShoppingBag} />
        <StatCard label="Views" value={num(views)} icon={Eye} />
        <StatCard
          label="Comisión"
          value={eur(totals.commission)}
          icon={Coins}
          accent="text-accent"
        />
        <StatCard label="GMV total" value={eur(totals.gmv)} icon={TrendingUp} accent="text-brand" />
        <StatCard label="Vídeos hechos" value={num(totals.videos)} icon={Film} />
        {/* Calificación del producto */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-2"
          style={{ backgroundColor: tierBg }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: tierFg, opacity: 0.85 }}>
              Calificación
            </span>
            <Award size={18} style={{ color: tierFg }} />
          </div>
          {tier ? (
            <div className="flex items-end justify-between">
              <span className="text-3xl" aria-hidden>{tier.tier.emoji}</span>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: tierFg }}>
                {tier.tier.label}
              </span>
            </div>
          ) : (
            <div className="flex items-end justify-between">
              <span className="text-3xl opacity-50" aria-hidden>—</span>
              <span className="text-[11px] opacity-70" style={{ color: tierFg }}>
                Necesita más views
              </span>
            </div>
          )}
        </div>
      </div>

      <ProductForm open={editOpen} onClose={() => setEditOpen(false)} product={product} />

      <Modal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="Cambiar estado del producto"
        size="md"
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

function StatCard({
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
      <div className={`text-2xl font-bold tnum ${accent ?? ''}`}>{value}</div>
    </div>
  )
}
