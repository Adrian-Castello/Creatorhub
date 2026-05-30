import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, ImagePlus, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ProductPickerModal } from '../ui/ProductPickerModal'
import { ImportFromScreenshotModal } from '../ui/ImportFromScreenshotModal'
import { Confetti } from '../ui/Confetti'
import { useData } from '../../hooks/useData'
import { fromKey, formatLongDate } from '../../lib/dates'
import { saleCommission } from '../../lib/calculations'
import { STATUS_COLORS } from '../../lib/constants'
import { eur } from '../../lib/format'
import type { Product } from '../../lib/types'

interface Props {
  open: boolean
  dayKey: string | null
  onClose: () => void
  /** compact embed mode (Home) hides notes & uses tighter layout */
  embedded?: boolean
}

export function DayModal({ open, dayKey, onClose }: Props) {
  const {
    products,
    videos,
    sales,
    dayViews,
    settings,
    setVideo,
    removeVideo,
    upsertSale,
    deleteSale,
    upsertDayView,
    deleteDayView,
  } = useData()

  const goal = settings.daily_video_goal
  const [confettiFire, setConfettiFire] = useState(0)
  const [salePickerOpen, setSalePickerOpen] = useState(false)
  const [viewsPickerOpen, setViewsPickerOpen] = useState(false)
  const [videoPickerSlot, setVideoPickerSlot] = useState<number | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const prevCompleted = useRef(0)

  const dayVideos = useMemo(
    () => videos.filter((v) => v.day_date === dayKey),
    [videos, dayKey],
  )
  const daySales = useMemo(
    () => sales.filter((s) => s.day_date === dayKey),
    [sales, dayKey],
  )
  const dayDayViews = useMemo(
    () => dayViews.filter((v) => v.day_date === dayKey),
    [dayViews, dayKey],
  )
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  )

  const completed = dayVideos.length

  // Micro-celebration when hitting the goal.
  useEffect(() => {
    if (!open) {
      prevCompleted.current = completed
      return
    }
    if (completed >= goal && prevCompleted.current < goal) {
      setConfettiFire((n) => n + 1)
    }
    prevCompleted.current = completed
  }, [completed, goal, open])

  if (!dayKey) return null

  const slots = Array.from({ length: goal }, (_, i) => i + 1)
  const totalGmv = daySales.reduce((s, x) => s + x.gmv, 0)
  const totalCommission = daySales.reduce(
    (s, x) => s + saleCommission(x, productMap.get(x.product_id)),
    0,
  )
  const goalReached = completed >= goal

  function toggleSlot(slot: number) {
    const exists = dayVideos.find((v) => v.slot === slot)
    if (exists) removeVideo(dayKey!, slot)
    else setVideo(dayKey!, slot, null)
  }

  const usedProductIds = new Set(daySales.map((s) => s.product_id))
  const availableForSale = products.filter((p) => !usedProductIds.has(p.id))
  const usedViewsProductIds = new Set(dayDayViews.map((v) => v.product_id))
  const availableForViews = products.filter((p) => !usedViewsProductIds.has(p.id))

  function handleClose() {
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      title={
        <span className="capitalize">{formatLongDate(fromKey(dayKey))}</span>
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleClose}>Guardar</Button>
        </>
      }
    >
      <div className="relative space-y-7">
        <Confetti fire={confettiFire} />

        {/* Section 1: Videos checklist */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Vídeos
            </h3>
            <motion.span
              animate={goalReached ? { scale: [1, 1.15, 1] } : {}}
              className={`text-sm font-semibold tnum ${
                goalReached ? 'text-st-activo' : ''
              }`}
            >
              {completed}/{goal}
            </motion.span>
          </div>

          <div className="space-y-2">
            {slots.map((slot) => {
              const video = dayVideos.find((v) => v.slot === slot)
              const checked = Boolean(video)
              return (
                <motion.div
                  key={slot}
                  layout
                  className={`flex items-center gap-3 rounded-xl border p-2.5 transition-colors ${
                    checked ? 'border-brand/30 bg-brand/[0.04]' : 'hairline'
                  }`}
                >
                  <button
                    onClick={() => toggleSlot(slot)}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                      checked
                        ? 'border-brand bg-brand text-white'
                        : 'hairline'
                    }`}
                  >
                    <AnimatePresence>
                      {checked && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check size={16} strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <span className="flex-1 text-sm font-medium">Vídeo {slot}</span>
                  {checked && (
                    <button
                      onClick={() => setVideoPickerSlot(slot)}
                      title={video?.product_id ? productMap.get(video.product_id)?.name : 'Asignar producto'}
                      aria-label="Asignar producto"
                      className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl surface transition-all hover:border-brand/40 hover:scale-105"
                    >
                      {video?.product_id && productMap.get(video.product_id)?.image_url ? (
                        <>
                          <img
                            src={productMap.get(video.product_id)!.image_url!}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <span
                            className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card dark:ring-d-card"
                            style={{ backgroundColor: STATUS_COLORS[productMap.get(video.product_id)!.status] }}
                          />
                        </>
                      ) : (
                        <ImagePlus size={18} className="text-muted" />
                      )}
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Section 2: Sales */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Ventas
            </h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSalePickerOpen(true)}
              disabled={availableForSale.length === 0}
            >
              <Plus size={15} /> Añadir producto
            </Button>
          </div>

          <div className="space-y-2">
            {daySales.length === 0 && (
              <p className="rounded-xl border border-dashed hairline py-5 text-center text-sm text-muted">
                Sin ventas registradas
              </p>
            )}

            {daySales.map((sale) => {
              const product = productMap.get(sale.product_id)
              const commission = saleCommission(sale, product)
              return (
                <SaleRow
                  key={sale.id}
                  product={product}
                  units={sale.units}
                  gmv={sale.gmv}
                  commission={commission}
                  onChange={(units, gmv) =>
                    upsertSale(dayKey!, sale.product_id, units, gmv)
                  }
                  onDelete={() => deleteSale(sale.id)}
                />
              )
            })}
          </div>

          {daySales.length > 0 && (
            <div className="mt-4 flex items-center justify-end gap-6 border-t hairline pt-4">
              <div className="text-right">
                <div className="text-xs text-muted">GMV total</div>
                <div className="text-xl font-bold tnum">{eur(totalGmv)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted">Comisión total</div>
                <div className="text-xl font-bold tnum text-accent">
                  {eur(totalCommission)}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Visualizaciones por producto */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Visualizaciones
            </h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setViewsPickerOpen(true)}
              disabled={availableForViews.length === 0}
            >
              <Plus size={15} /> Añadir producto
            </Button>
          </div>

          <div className="space-y-2">
            {dayDayViews.length === 0 && (
              <p className="rounded-xl border border-dashed hairline py-5 text-center text-sm text-muted">
                Sin visualizaciones registradas
              </p>
            )}

            <AnimatePresence>
              {dayDayViews.map((dv) => {
                const p = productMap.get(dv.product_id)
                return (
                  <motion.div
                    key={dv.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2 rounded-xl surface p-2.5"
                  >
                    {p?.image_url ? (
                      <img src={p.image_url} alt={p.name} title={p?.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-black/5 dark:bg-white/10" title={p?.name ?? '—'} />
                    )}
                    <label className="flex h-10 flex-1 items-center gap-1.5 rounded-lg surface px-2.5 focus-within:border-brand/60">
                      <span className="text-[10px] uppercase tracking-wide text-muted">Views</span>
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={dv.views || ''}
                        placeholder="0"
                        onChange={(e) => {
                          const n = parseInt(e.target.value) || 0
                          if (dayKey) upsertDayView(dayKey, dv.product_id, n)
                        }}
                        className="w-full min-w-0 bg-transparent text-right text-sm outline-none tnum"
                      />
                    </label>
                    <button
                      onClick={() => deleteDayView(dv.id)}
                      className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-st-descartado/10 hover:text-st-descartado"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* Section 4: Analizar con IA */}
        <section>
          <button
            onClick={() => setImportOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border hairline p-3 text-left transition-colors hover:border-brand/40 hover:bg-brand/[0.04]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">Analizar con IA</div>
                <div className="mt-0.5 text-xs text-muted">
                  Sube una captura de TikTok Shop y rellénalo todo
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-muted" />
          </button>
        </section>
      </div>

      <ProductPickerModal
        open={videoPickerSlot !== null}
        onClose={() => setVideoPickerSlot(null)}
        products={products.filter((p) => p.status !== 'descartado')}
        value={
          videoPickerSlot !== null
            ? dayVideos.find((v) => v.slot === videoPickerSlot)?.product_id ?? null
            : null
        }
        onPick={(pid) => {
          if (videoPickerSlot !== null && dayKey) setVideo(dayKey, videoPickerSlot, pid)
        }}
        title={videoPickerSlot !== null ? `Producto para vídeo ${videoPickerSlot}` : 'Elige un producto'}
      />

      <ProductPickerModal
        open={salePickerOpen}
        onClose={() => setSalePickerOpen(false)}
        products={availableForSale}
        value={null}
        onPick={(pid) => {
          if (dayKey) upsertSale(dayKey, pid, 0, 0)
        }}
        title="Añadir producto a las ventas"
      />

      <ProductPickerModal
        open={viewsPickerOpen}
        onClose={() => setViewsPickerOpen(false)}
        products={availableForViews}
        value={null}
        onPick={(pid) => {
          if (dayKey) upsertDayView(dayKey, pid, 0)
        }}
        title="Añadir producto a las visualizaciones"
      />

      {dayKey && (
        <ImportFromScreenshotModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          dayKey={dayKey}
        />
      )}
    </Modal>
  )
}

function SaleRow({
  product,
  units,
  gmv,
  commission,
  onChange,
  onDelete,
}: {
  product: Product | undefined
  units: number
  gmv: number
  commission: number
  onChange: (units: number, gmv: number) => void
  onDelete: () => void
}) {
  const [u, setU] = useState(String(units || ''))
  const [g, setG] = useState(String(gmv || ''))

  useEffect(() => setU(units ? String(units) : ''), [units])
  useEffect(() => setG(gmv ? String(gmv) : ''), [gmv])

  function commit(nu: string, ng: string) {
    onChange(parseInt(nu) || 0, parseFloat(ng) || 0)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-2 rounded-xl surface p-2.5"
    >
      {product?.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          title={product?.name}
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div
          className="h-10 w-10 shrink-0 rounded-lg bg-black/5 dark:bg-white/10"
          title={product?.name ?? 'Producto eliminado'}
        />
      )}

      <div className="flex flex-1 items-center gap-2">
        <label className="flex h-10 flex-1 items-center gap-1.5 rounded-lg surface px-2.5 focus-within:border-brand/60">
          <span className="text-[10px] uppercase tracking-wide text-muted">Uds</span>
          <input
            type="number"
            min={0}
            value={u}
            onChange={(e) => {
              setU(e.target.value)
              commit(e.target.value, g)
            }}
            placeholder="0"
            className="w-full min-w-0 bg-transparent text-right text-sm outline-none tnum"
          />
        </label>
        <label className="flex h-10 flex-1 items-center gap-1.5 rounded-lg surface px-2.5 focus-within:border-brand/60">
          <span className="text-[10px] uppercase tracking-wide text-muted">GMV €</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={g}
            onChange={(e) => {
              setG(e.target.value)
              commit(u, e.target.value)
            }}
            placeholder="0"
            className="w-full min-w-0 bg-transparent text-right text-sm outline-none tnum"
          />
        </label>
        <div className="hidden sm:block w-16 text-right text-sm font-semibold tnum text-accent">
          {eur(commission)}
        </div>
        <button
          onClick={onDelete}
          className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-st-descartado/10 hover:text-st-descartado"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  )
}
