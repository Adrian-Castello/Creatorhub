import { motion } from 'framer-motion'
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
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative flex flex-col gap-2 rounded-2xl p-4 text-left transition-all"
            style={{
              backgroundColor: bg,
              borderColor: active ? color : 'transparent',
              borderWidth: '2px',
              borderStyle: 'solid',
              boxShadow: active ? `0 4px 16px -4px ${color}40` : undefined,
            }}
          >
            {/* Cabecera: punto + label */}
            <div className="flex items-center gap-2.5">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: active
                    ? `0 0 0 4px ${color}25, 0 0 12px ${color}80`
                    : `0 0 0 3px ${color}15`,
                }}
              />
              <span
                className="text-sm font-bold tracking-tight"
                style={{ color: active ? color : undefined }}
              >
                {STATUS_LABELS[s]}
              </span>
            </div>
            {/* Descripción */}
            <p className="text-xs text-muted leading-relaxed">
              {STATUS_DESCRIPTIONS[s]}
            </p>
          </motion.button>
        )
      })}
    </div>
  )
}
