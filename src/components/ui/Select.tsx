import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import type { Product } from '../../lib/types'
import { StatusDot } from '../Products/StatusBadge'

interface Props {
  products: Product[]
  value: string | null
  onChange: (id: string) => void
  placeholder?: string
}

export function ProductSelect({
  products,
  value,
  onChange,
  placeholder = 'Selecciona producto',
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = products.find((p) => p.id === value) || null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, query])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 surface rounded-xl px-3 h-10 text-left text-sm transition-colors hover:border-brand/40"
      >
        {selected ? (
          <>
            {selected.image_url ? (
              <img
                src={selected.image_url}
                alt=""
                className="h-6 w-6 rounded-md object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-md bg-black/5 dark:bg-white/10" />
            )}
            <span className="flex-1 truncate">{selected.name}</span>
            <StatusDot status={selected.status} />
          </>
        ) : (
          <span className="flex-1 truncate text-muted">{placeholder}</span>
        )}
        <ChevronDown size={16} className="text-muted shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border hairline bg-card dark:bg-d-card shadow-soft-lg animate-pop-in">
          <div className="flex items-center gap-2 border-b hairline px-3 py-2">
            <Search size={15} className="text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted">
                Sin resultados
              </div>
            )}
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange(p.id)
                  setOpen(false)
                  setQuery('')
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="h-7 w-7 rounded-md object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-md bg-black/5 dark:bg-white/10" />
                )}
                <span className="flex-1 truncate">{p.name}</span>
                {p.id === value && <Check size={16} className="text-brand" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
