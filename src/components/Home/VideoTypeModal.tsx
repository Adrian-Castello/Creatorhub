import { motion } from 'framer-motion'
import { Film, Images, Sparkles } from 'lucide-react'
import { Modal } from '../ui/Modal'
import type { VideoType } from '../../lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onPick: (type: VideoType) => void
  current?: VideoType
}

const OPTIONS: Array<{
  value: VideoType
  label: string
  description: string
  icon: typeof Film
  color: string
  gradient: string
}> = [
  {
    value: 'video',
    label: 'Vídeo',
    description: 'Publicación de vídeo clásica',
    icon: Film,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
  },
  {
    value: 'carrusel',
    label: 'Carrusel',
    description: 'Publicación con varias imágenes',
    icon: Images,
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)',
  },
]

export function VideoTypeModal({ open, onClose, onPick, current }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="¿Qué tipo de publicación es?" size="md">
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((opt, i) => {
          const Icon = opt.icon
          const active = opt.value === current
          return (
            <motion.button
              key={opt.value}
              onClick={() => onPick(opt.value)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                delay: i * 0.05,
              }}
              className="group relative flex aspect-[5/4] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl p-5 text-center transition-shadow hover:shadow-soft-lg"
              style={{
                background: opt.gradient,
                border: active ? `3px solid ${opt.color}` : '3px solid transparent',
                boxShadow: active
                  ? `0 0 0 4px ${opt.color}30, 0 12px 40px -8px ${opt.color}60`
                  : `0 6px 20px -8px ${opt.color}40`,
              }}
            >
              {/* Brillos sutiles de fondo */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl"
                style={{ backgroundColor: '#FFFFFF' }}
              />
              <div
                className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full opacity-15 blur-2xl"
                style={{ backgroundColor: '#000000' }}
              />

              {/* Icono grande con halo */}
              <motion.div
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <Icon size={32} className="text-white drop-shadow-lg" strokeWidth={2.2} />
                {active && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] shadow-lg"
                    style={{ color: opt.color }}
                  >
                    <Sparkles size={12} fill="currentColor" />
                  </motion.span>
                )}
              </motion.div>

              {/* Label y descripción */}
              <div className="relative space-y-0.5">
                <div className="text-lg font-bold tracking-tight text-white drop-shadow">
                  {opt.label}
                </div>
                <p className="text-xs text-white/85 leading-snug">
                  {opt.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </Modal>
  )
}
