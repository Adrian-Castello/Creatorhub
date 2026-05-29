import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useThemeContext } from '../../hooks/themeContext'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggle } = useThemeContext()
  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl text-sub transition-colors hover:bg-black/5 dark:text-d-sub dark:hover:bg-white/5 ${className}`}
    >
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </motion.span>
    </button>
  )
}
