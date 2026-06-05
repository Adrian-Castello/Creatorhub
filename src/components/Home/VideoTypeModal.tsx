import { motion } from 'framer-motion'
import { Film, Images } from 'lucide-react'
import { Modal } from '../ui/Modal'
import type { VideoType } from '../../lib/types'

interface Props {
  open: boolean
  onClose: () => void
  /** Llamado con el tipo elegido. */
  onPick: (type: VideoType) => void
  /** Marca uno como ya seleccionado (al editar un slot existente). */
  current?: VideoType
}

const OPTIONS: Array<{
  value: VideoType
  label: string
  description: string
  icon: typeof Film
  color: string
}> = [
  {
    value: 'video',
    label: 'Vídeo',
    description: 'Publicación de vídeo clásica',
    icon: Film,
    color: '#8B5CF6', // violeta brand
  },
  {
    value: 'carrusel',
    label: 'Carrusel',
    description: 'Publicación con varias imágenes',
    icon: Images,
    color: '#06B6D4', // cian
  },
]

export function VideoTypeModal({ open, onClose, onPick, current }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="¿Qué tipo de publicación es?" size="sm">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon
          const active = opt.value === current
          return (
            <motion.button
              key={opt.value}
              onClick={() => onPick(opt.value)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex flex-col gap-2 rounded-2xl p-4 text-left transition-all"
              style={{
                backgroundColor: active ? `${opt.color}1A` : undefined,
                borderColor: active ? opt.color : 'transparent',
                borderWidth: '2px',
                borderStyle: 'solid',
                boxShadow: active ? `0 4px 16px -4px ${opt.color}40` : undefined,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${opt.color}26`, color: opt.color }}
                >
                  <Icon size={18} />
                </span>
                <span
                  className="text-sm font-bold tracking-tight"
                  style={{ color: active ? opt.color : undefined }}
                >
                  {opt.label}
                </span>
              </div>
              <p className="text-xs text-muted leading-snug">{opt.description}</p>
            </motion.button>
          )
        })}
      </div>
    </Modal>
  )
}
