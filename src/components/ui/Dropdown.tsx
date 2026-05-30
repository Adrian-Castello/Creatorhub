import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  value: T
  options: Option<T>[]
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 surface rounded-xl px-3 h-10 text-sm font-medium transition-colors hover:border-brand/40"
      >
        <span>{selected?.label ?? 'Seleccionar'}</span>
        <ChevronDown size={15} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 min-w-[160px] overflow-hidden rounded-xl border hairline bg-card dark:bg-d-card shadow-soft-lg animate-pop-in">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span>{o.label}</span>
              {o.value === value && <Check size={15} className="text-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
