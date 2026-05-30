import { useMemo, useState, useEffect, useRef } from 'react'
import { Search, Check } from 'lucide-react'
import { Modal } from './Modal'
import type { Product } from '../../lib/types'

interface Props {
  open: boolean
  onClose: () => void
  products: Product[]
  value: string | null
  onPick: (id: string) => void
  title?: string
}

export function ProductPickerModal({
  open,
  onClose,
  products,
  value,
  onPick,
  title = 'Elige un producto',
}: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      // small delay so the modal animation finishes before we steal focus
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, query])

  function pick(id: string) {
    onPick(id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <div className="space-y-3">
        {/* Buscador */}
        <div className="flex items-center gap-2 surface rounded-xl px-3 h-11 focus-within:border-brand/60">
          <Search size={17} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-muted hover:text-ink dark:hover:text-d-ink"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Lista */}
        <div className="-mx-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-12 text-center text-sm text-muted">
              {query ? `Sin resultados para "${query}"` : 'No hay productos todavía'}
            </div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((p) => {
                const selected = p.id === value
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => pick(p.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors ${
                        selected
                          ? 'bg-brand/10'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 shrink-0 rounded-lg bg-black/5 dark:bg-white/10" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">
                          {p.name}
                        </div>
                      </div>
                      {selected && (
                        <Check size={18} className="text-brand shrink-0" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
