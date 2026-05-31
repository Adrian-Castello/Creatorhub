import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'

export interface DropdownOption<T extends string> {
  value: T
  label: string
  /** Color opcional. Si se pasa, aparece un punto a la izquierda del label */
  color?: string
}

interface Props<T extends string> {
  value: T
  options: DropdownOption<T>[]
  onChange: (v: T) => void
  className?: string
}

export function Dropdown<T extends string>({ value, options, onChange, className = '' }: Props<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-2.5 surface rounded-xl px-3.5 h-10 text-sm font-semibold transition-all ${
          open ? 'border-brand/50 shadow-soft-lg' : 'hover:border-brand/40'
        }`}
        style={{
          boxShadow: open && selected?.color ? `0 0 0 3px ${selected.color}15` : undefined,
        }}
      >
        {selected?.color && (
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor: selected.color,
              boxShadow: `0 0 0 3px ${selected.color}25`,
            }}
          />
        )}
        <span>{selected?.label ?? 'Seleccionar'}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted"
        >
          <ChevronDown size={15} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 min-w-[200px] overflow-hidden rounded-xl border hairline bg-card dark:bg-d-card shadow-soft-lg"
          >
            <div className="p-1">
              {options.map((o) => {
                const isActive = o.value === value
                return (
                  <button
                    key={o.value}
                    onClick={() => {
                      onChange(o.value)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand/[0.08]'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={isActive && o.color ? { color: o.color } : undefined}
                  >
                    {o.color ? (
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: o.color,
                          boxShadow: isActive ? `0 0 0 3px ${o.color}25` : `0 0 0 2px ${o.color}10`,
                        }}
                      />
                    ) : (
                      <span className="inline-block h-2.5 w-2.5 shrink-0" />
                    )}
                    <span className="flex-1">{o.label}</span>
                    {isActive && <Check size={15} className="text-brand" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
