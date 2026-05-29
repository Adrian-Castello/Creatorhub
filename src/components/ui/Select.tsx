import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import type { Product, ProductStatus } from '../../lib/types'
import { STATUS_COLORS } from '../../lib/constants'
import { StatusDot } from '../Products/StatusBadge'

function getStatusColor(s: ProductStatus): string {
  return STATUS_COLORS[s]
}

interface Props {
  products: Product[]
  value: string | null
  onChange: (id: string) => void
  placeholder?: string
  /** compact: si hay producto seleccionado, muestra solo la foto (sin nombre). */
  compact?: boolean
}

export function ProductSelect({
  products,
  value,
  onChange,
  placeholder = 'Selecciona producto',
  compact = false,
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

  // En modo compact con producto seleccionado: botón pequeño solo con foto.
  if (compact && selected) {
    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          title={selected.name}
          aria-label={selected.name}
          className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl surface transition-all hover:border-brand/40 hover:scale-105"
        >
          {selected.image_url ? (
            <img
              src={selected.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-black/5 dark:bg-white/10" />
          )}
          <span
            className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card dark:ring-d-card"
            style={{ backgroundColor: getStatusColor(selected.status) }}
            title={selected.status}
          />
        </button>

        {open && (
          <div className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border hairline bg-card dark:bg-d-card shadow-soft-lg animate-pop-in">
            <SearchAndList
              products={products}
              filtered={filtered}
              query={query}
              setQuery={setQuery}
              value={value}
              onPick={(pid) => {
                onChange(pid)
                setOpen(false)
                setQuery('')
              }}
            />
          </div>
        )}
      </div>
    )
  }

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
          <SearchAndList
            products={products}
            filtered={filtered}
            query={query}
            setQuery={setQuery}
            value={value}
            onPick={(pid) => {
              onChange(pid)
              setOpen(false)
              setQuery('')
            }}
          />
        </div>
      )}
    </div>
  )
}

function SearchAndList({
  filtered,
  query,
  setQuery,
  value,
  onPick,
}: {
  products: Product[]
  filtered: Product[]
  query: string
  setQuery: (q: string) => void
  value: string | null
  onPick: (id: string) => void
}) {
  return (
    <>
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
            onClick={() => onPick(p.id)}
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
    </>
  )
}
