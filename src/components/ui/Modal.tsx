import { type ReactNode, useEffect, useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  /** full-screen on mobile (default true), centered on desktop */
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
}

const maxW: Record<NonNullable<Props['size']>, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
}

// Set global de IDs de modales abiertos. Más robusto que un contador:
// los IDs son únicos y un cleanup que no se ejecuta no deja basura permanente
// porque el siguiente render del mismo modal vuelve a poner su mismo id.
// Si el set queda vacío, el body se desbloquea.
const openModalIds = new Set<string>()

function syncBodyLock() {
  if (openModalIds.size > 0) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Mecanismo extra de seguridad: si el usuario vuelve a la pestaña o
// recarga, garantizamos que el body queda libre.
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', () => {
    openModalIds.clear()
    document.body.style.overflow = ''
  })
}

export function Modal({ open, onClose, title, children, size = 'md', footer }: Props) {
  const id = useId()

  useEffect(() => {
    if (!open) {
      // Si pasamos a cerrado, asegurarnos de quitar este id del set
      // por si alguna iteración previa lo había añadido sin cleanup.
      if (openModalIds.delete(id)) {
        syncBodyLock()
      }
      return
    }
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    openModalIds.add(id)
    syncBodyLock()
    return () => {
      document.removeEventListener('keydown', handler)
      openModalIds.delete(id)
      syncBodyLock()
    }
  }, [open, onClose, id])

  return (
    <AnimatePresence
      onExitComplete={() => {
        // Defensa final: una vez que la animación de salida termine,
        // si este modal ya no está abierto, su id no debería estar.
        if (!open && openModalIds.delete(id)) {
          syncBodyLock()
        }
      }}
    >
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className={`relative z-10 flex w-full flex-col bg-card dark:bg-d-card sm:rounded-2xl sm:border sm:hairline sm:shadow-soft-lg ${maxW[size]} sm:w-full h-full sm:h-auto sm:max-h-[90vh]`}
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {title !== undefined && (
              <div className="flex items-center justify-between gap-4 border-b hairline px-5 py-4 shrink-0">
                <div className="text-lg font-semibold">{title}</div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-sub transition-colors hover:bg-black/5 dark:hover:bg-white/10 dark:text-d-sub"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t hairline px-5 py-4 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
