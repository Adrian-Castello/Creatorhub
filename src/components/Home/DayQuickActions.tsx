import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ImagePlus, Receipt } from 'lucide-react'
import { Button } from '../ui/Button'
import { ProductPickerModal } from '../ui/ProductPickerModal'
import { useData } from '../../hooks/useData'
import { STATUS_COLORS } from '../../lib/constants'

interface Props {
  dayKey: string
  onOpenDay: () => void
}

export function DayQuickActions({ dayKey, onOpenDay }: Props) {
  const { products, videos, settings, setVideo, removeVideo } = useData()
  const goal = settings.daily_video_goal
  const [pickerSlot, setPickerSlot] = useState<number | null>(null)

  const dayVideos = useMemo(
    () => videos.filter((v) => v.day_date === dayKey),
    [videos, dayKey],
  )
  const slots = Array.from({ length: goal }, (_, i) => i + 1)
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  )

  function toggleSlot(slot: number) {
    const exists = dayVideos.find((v) => v.slot === slot)
    if (exists) removeVideo(dayKey, slot)
    else setVideo(dayKey, slot, null)
  }

  const pickerVideo = pickerSlot != null
    ? dayVideos.find((v) => v.slot === pickerSlot)
    : null

  return (
    <div className="surface rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Vídeos del día
        </h2>
        <Button size="sm" variant="secondary" onClick={onOpenDay}>
          <Receipt size={15} /> Registrar ventas
        </Button>
      </div>

      <div className="space-y-2">
        {slots.map((slot) => {
          const video = dayVideos.find((v) => v.slot === slot)
          const checked = Boolean(video)
          const product = video?.product_id ? productMap.get(video.product_id) : null
          return (
            <div
              key={slot}
              className={`flex items-center gap-3 rounded-xl border p-2.5 transition-colors ${
                checked ? 'border-brand/30 bg-brand/[0.04]' : 'hairline'
              }`}
            >
              <button
                onClick={() => toggleSlot(slot)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                  checked ? 'border-brand bg-brand text-white' : 'hairline'
                }`}
              >
                <AnimatePresence>
                  {checked && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <span className="flex-1 text-sm font-medium">Vídeo {slot}</span>
              {checked && (
                <button
                  onClick={() => setPickerSlot(slot)}
                  title={product?.name ?? 'Asignar producto'}
                  aria-label={product?.name ?? 'Asignar producto'}
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl surface transition-all hover:border-brand/40 hover:scale-105"
                >
                  {product?.image_url ? (
                    <>
                      <img
                        src={product.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span
                        className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card dark:ring-d-card"
                        style={{ backgroundColor: STATUS_COLORS[product.status] }}
                      />
                    </>
                  ) : (
                    <ImagePlus size={18} className="text-muted" />
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <ProductPickerModal
        open={pickerSlot !== null}
        onClose={() => setPickerSlot(null)}
        products={products}
        value={pickerVideo?.product_id ?? null}
        onPick={(pid) => {
          if (pickerSlot !== null) setVideo(dayKey, pickerSlot, pid)
        }}
        title={pickerSlot !== null ? `Producto para vídeo ${pickerSlot}` : 'Elige un producto'}
      />
    </div>
  )
}
