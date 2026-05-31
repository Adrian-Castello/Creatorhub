import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ProductStatus } from '../../lib/types'
import { STATUSES, STATUS_COLORS, STATUS_LABELS, STATUS_TINTS } from '../../lib/constants'
import { useThemeContext } from '../../hooks/themeContext'

interface Props {
  value: ProductStatus
  onChange: (s: ProductStatus) => void
}

const STATUS_DESCRIPTIONS: Record<ProductStatus, string> = {
  solicitado: 'Acabo de pedirlo, todavía no me ha llegado',
  recibido: 'Ya está en mi poder, pendiente de empezar a probarlo',
  testeando: 'Estoy haciendo vídeos y midiendo cómo responde',
  activo: 'Funciona bien, sigue generando ventas',
  descartado: 'No funcionó como esperaba, dejo de promocionarlo',
}

export function StatusPicker({ value, onChange }: Props) {
  const { isDark } = useThemeContext()

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {STATUSES.map((s) => {
        const active = s === value
        const color = STATUS_COLORS[s]
        const tint = STATUS_TINTS[s]
        const bg = isDark ? tint.darkBg : tint.lightBg

        return (
          <motion.button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all"
            style={{
              backgroundColor: bg,
              borderColor: active ? color : 'transparent',
              borderWidth: '2px',
            }}
          >
            {/* Punto de color */}
            <div
              className="mt-1 h-3 w-3 shrink-0 rounded-full shadow-sm"
              style={{
                backgroundColor: color,
                boxShadow: active ? `0 0 0 4px ${color}33` : undefined,
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">
                  {STATUS_LABELS[s]}
                </span>
                {active && (
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: color }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted leading-snug">
                {STATUS_DESCRIPTIONS[s]}
              </p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
