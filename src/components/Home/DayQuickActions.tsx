import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Receipt } from 'lucide-react'
import { Button } from '../ui/Button'
import { ProductSelect } from '../ui/Select'
import { useData } from '../../hooks/useData'

interface Props {
  dayKey: string
  onOpenDay: () => void
}

export function DayQuickActions({ dayKey, onOpenDay }: Props) {
  const { products, videos, settings, setVideo, removeVideo } = useData()
  const goal = settings.daily_video_goal

  const dayVideos = useMemo(
    () => videos.filter((v) => v.day_date === dayKey),
    [videos, dayKey],
  )
  const slots = Array.from({ length: goal }, (_, i) => i + 1)

  function toggleSlot(slot: number) {
    const exists = dayVideos.find((v) => v.slot === slot)
    if (exists) removeVideo(dayKey, slot)
    else setVideo(dayKey, slot, null)
  }

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
                <ProductSelect
                  products={products}
                  value={video?.product_id ?? null}
                  onChange={(pid) => setVideo(dayKey, slot, pid)}
                  placeholder="Producto"
                  compact
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
