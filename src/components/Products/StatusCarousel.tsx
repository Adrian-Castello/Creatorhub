import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductStatus } from '../../lib/types'
import { STATUSES, STATUS_COLORS, STATUS_LABELS, STATUS_TINTS } from '../../lib/constants'
import { useThemeContext } from '../../hooks/themeContext'

interface Props {
  value: ProductStatus
  onChange: (s: ProductStatus) => void
}

const STATUS_DESCRIPTIONS: Record<ProductStatus, string> = {
  solicitado: 'Acabo de pedirlo, todavía no me ha llegado',
  recibido: 'Ya está en mi poder, pendiente de probarlo',
  testeando: 'Haciendo vídeos y midiendo cómo responde',
  activo: 'Funciona bien, sigue generando ventas',
  descartado: 'No funcionó, dejo de promocionarlo',
}

export function StatusCarousel({ value, onChange }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { isDark } = useThemeContext()
  const trackRef = useRef<HTMLDivElement>(null)

  // Cuando se expande, centrar el activo
  useEffect(() => {
    if (!expanded) return
    const idx = STATUSES.indexOf(value)
    const t = trackRef.current
    if (!t) return
    const child = t.children[idx] as HTMLElement | undefined
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [expanded, value])

  function StatusCard({ status, isActive }: { status: ProductStatus; isActive: boolean }) {
    const color = STATUS_COLORS[status]
    const tint = STATUS_TINTS[status]
    const bg = isDark ? tint.darkBg : tint.lightBg
    return (
      <button
        type="button"
        onClick={() => {
          onChange(status)
          setExpanded(false)
        }}
        className="snap-center shrink-0 flex flex-col gap-1.5 rounded-xl p-3 text-left transition-all"
        style={{
          width: 200,
          backgroundColor: bg,
          borderColor: isActive ? color : 'transparent',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: isActive ? `0 4px 16px -4px ${color}40` : undefined,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: isActive
                ? `0 0 0 4px ${color}25, 0 0 12px ${color}80`
                : `0 0 0 3px ${color}15`,
            }}
          />
          <span
            className="text-sm font-bold tracking-tight"
            style={{ color: isActive ? color : undefined }}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>
        <p className="text-[11px] leading-snug text-muted">
          {STATUS_DESCRIPTIONS[status]}
        </p>
      </button>
    )
  }

  // Vista colapsada: solo la card del estado actual
  if (!expanded) {
    return (
      <motion.button
        type="button"
        onClick={() => setExpanded(true)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="flex w-full items-center gap-3 rounded-xl p-3 text-left"
        style={{
          backgroundColor: isDark ? STATUS_TINTS[value].darkBg : STATUS_TINTS[value].lightBg,
          borderColor: STATUS_COLORS[value],
          borderWidth: '2px',
          borderStyle: 'solid',
        }}
      >
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full"
          style={{
            backgroundColor: STATUS_COLORS[value],
            boxShadow: `0 0 0 4px ${STATUS_COLORS[value]}25`,
          }}
        />
        <div className="min-w-0 flex-1">
          <div
            className="text-sm font-bold tracking-tight"
            style={{ color: STATUS_COLORS[value] }}
          >
            {STATUS_LABELS[value]}
          </div>
          <p className="text-[11px] text-muted leading-snug">
            {STATUS_DESCRIPTIONS[value]}
          </p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-muted" />
      </motion.button>
    )
  }

  // Vista expandida: carrusel horizontal
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-muted">Desliza para elegir</span>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Cerrar selector"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: 'thin' }}
        >
          {STATUSES.map((s) => (
            <StatusCard key={s} status={s} isActive={s === value} />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
