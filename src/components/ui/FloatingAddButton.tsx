import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export function FloatingAddButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="md:hidden fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-glow"
      aria-label="Añadir"
    >
      <Plus size={26} />
    </motion.button>
  )
}
