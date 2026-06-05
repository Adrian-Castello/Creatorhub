import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
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
  testeando: 'Haciendo publicaciones y midiendo cómo responde',
  activo: 'Funciona bien, sigue generando ventas',
  descartado: 'No funcionó, dejo de promocionarlo',
}

export function StatusCarousel({ value, onChange }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { isDark } = useThemeContext()

  return (
    <div className="space-y-2">
      {/* Card del estado actual (siempre visible, clic la expande) */}
      <motion.button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
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
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-muted"
        >
          <ChevronDown size={18} />
        </motion.span>
      </motion.button>

      {/* Resto de estados desplegados hacia abajo */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-1">
              {STATUSES.filter((s) => s !== value).map((s, i) => {
                const color = STATUS_COLORS[s]
                const tint = STATUS_TINTS[s]
                const bg = isDark ? tint.darkBg : tint.lightBg
                return (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    type="button"
                    onClick={() => {
                      onChange(s)
                      setExpanded(false)
                    }}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors"
                    style={{
                      backgroundColor: bg,
                      borderColor: 'transparent',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                    }}
                  >
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 0 3px ${color}15`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold tracking-tight">
                        {STATUS_LABELS[s]}
                      </div>
                      <p className="text-[11px] text-muted leading-snug">
                        {STATUS_DESCRIPTIONS[s]}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
