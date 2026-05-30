import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, Sparkles, X } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { ProductPickerModal } from './ProductPickerModal'
import {
  anthropicConfigured,
  extractFromScreenshot,
  type ExtractedReport,
  type ExtractedRow,
} from '../../lib/aiImport'
import { useData } from '../../hooks/useData'
import { eur, num } from '../../lib/format'
import type { Product } from '../../lib/types'

interface Props {
  open: boolean
  onClose: () => void
  dayKey: string
}

type MatchedRow = ExtractedRow & {
  /** ID del producto al que se mapea esta fila. null = sin asignar */
  productId: string | null
  /** True si vino emparejado automáticamente por nombre */
  autoMatched: boolean
}

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function matchRows(rows: ExtractedRow[], products: Product[]): MatchedRow[] {
  return rows.map((r) => {
    const target = normalizeName(r.name)
    // 1) match exacto
    let p = products.find((x) => normalizeName(x.name) === target)
    // 2) match por inclusión (el más corto contenido en el otro)
    if (!p) {
      p = products.find((x) => {
        const n = normalizeName(x.name)
        return n.length >= 4 && (n.includes(target) || target.includes(n))
      })
    }
    return {
      ...r,
      productId: p?.id ?? null,
      autoMatched: Boolean(p),
    }
  })
}

export function ImportFromScreenshotModal({ open, onClose, dayKey }: Props) {
  const { products, sales, dayViews, upsertSale, deleteSale, upsertDayView, deleteDayView } = useData()
  const [stage, setStage] = useState<'pick' | 'loading' | 'review' | 'applying'>('pick')
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ExtractedReport | null>(null)
  const [matched, setMatched] = useState<MatchedRow[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pickingForIndex, setPickingForIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setStage('pick')
      setError(null)
      setReport(null)
      setMatched([])
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setPickingForIndex(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleFile(file: File) {
    setError(null)
    setStage('loading')
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
    try {
      const r = await extractFromScreenshot(file)
      setReport(r)
      setMatched(matchRows(r.rows, products))
      setStage('review')
    } catch (e: any) {
      setError(e?.message ?? 'Error desconocido')
      setStage('pick')
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('Sube una imagen (JPG o PNG).')
      return
    }
    handleFile(f)
    e.target.value = '' // permite re-subir misma foto
  }

  // Métricas resumen para mostrar al usuario
  const summary = useMemo(() => {
    const assigned = matched.filter((r) => r.productId)
    return {
      assigned: assigned.length,
      unassigned: matched.length - assigned.length,
      totalGmv: assigned.reduce((a, r) => a + r.gmv, 0),
      totalUnits: assigned.reduce((a, r) => a + r.units, 0),
      totalViews: assigned.reduce((a, r) => a + r.views, 0),
    }
  }, [matched])

  async function applyChanges() {
    setStage('applying')
    try {
      // 1. Borrar TODAS las ventas y visualizaciones existentes del día (la captura manda)
      const oldSales = sales.filter((s) => s.day_date === dayKey)
      const oldViews = dayViews.filter((v) => v.day_date === dayKey)
      await Promise.all([
        ...oldSales.map((s) => deleteSale(s.id)),
        ...oldViews.map((v) => deleteDayView(v.id)),
      ])
      // 2. Insertar lo nuevo (solo filas asignadas)
      for (const row of matched) {
        if (!row.productId) continue
        if (row.units > 0 || row.gmv > 0) {
          await upsertSale(dayKey, row.productId, row.units, row.gmv)
        }
        if (row.views > 0) {
          await upsertDayView(dayKey, row.productId, row.views)
        }
      }
      onClose()
    } catch (e: any) {
      setError('Error al aplicar: ' + (e?.message ?? ''))
      setStage('review')
    }
  }

  if (!anthropicConfigured) {
    return (
      <Modal open={open} onClose={onClose} title="Importar desde captura" size="sm">
        <div className="space-y-3 py-2">
          <div className="flex items-start gap-3 rounded-xl bg-st-testeando/10 p-3 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-st-testeando" />
            <div>
              <p className="font-medium">Esta función requiere configuración</p>
              <p className="mt-1 text-muted">
                Añade tu clave <code>VITE_ANTHROPIC_KEY</code> en los secrets de GitHub Actions y vuelve a desplegar.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Importar desde captura"
        size="md"
        footer={
          stage === 'review' ? (
            <>
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button
                onClick={applyChanges}
                disabled={summary.assigned === 0}
              >
                <CheckCircle2 size={16} /> Aplicar al día
              </Button>
            </>
          ) : null
        }
      >
        {stage === 'pick' && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Sube una captura del panel <strong>"Rendimiento de productos"</strong> de TikTok Shop para un solo día. La IA leerá ventas y visualizaciones por producto y te dejará revisarlo antes de guardar.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed hairline py-12 transition-colors hover:border-brand/60 hover:bg-brand/[0.03]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <ImagePlus size={22} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Pulsa para subir captura</p>
                <p className="mt-1 text-xs text-muted">JPG o PNG</p>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFile}
            />

            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-st-descartado/10 p-3 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-st-descartado" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {stage === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="relative">
              <Loader2 size={32} className="animate-spin text-brand" />
              <Sparkles size={14} className="absolute -right-1 -top-1 text-accent" />
            </div>
            <p className="text-sm font-medium">Analizando captura…</p>
            <p className="text-xs text-muted">Esto suele tardar unos segundos</p>
          </div>
        )}

        {(stage === 'review' || stage === 'applying') && report && (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl surface p-3">
                <div className="text-xs text-muted">GMV total</div>
                <div className="text-base font-bold tnum text-brand">{eur(summary.totalGmv)}</div>
              </div>
              <div className="rounded-xl surface p-3">
                <div className="text-xs text-muted">Ventas</div>
                <div className="text-base font-bold tnum">{num(summary.totalUnits)}</div>
              </div>
              <div className="rounded-xl surface p-3">
                <div className="text-xs text-muted">Visualizaciones</div>
                <div className="text-base font-bold tnum">{num(summary.totalViews)}</div>
              </div>
            </div>

            {summary.unassigned > 0 && (
              <div className="flex items-start gap-3 rounded-xl bg-st-testeando/10 p-3 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-st-testeando" />
                <span>
                  {summary.unassigned} producto{summary.unassigned > 1 ? 's' : ''} sin asignar. Asígnalo{summary.unassigned > 1 ? 's' : ''} o se ignorará{summary.unassigned > 1 ? 'n' : ''}.
                </span>
              </div>
            )}

            {/* Filas detectadas */}
            <div className="space-y-2">
              {matched.map((row, i) => {
                const product = row.productId ? products.find((p) => p.id === row.productId) : null
                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 transition-colors ${
                      row.productId ? 'hairline' : 'border-st-testeando/40 bg-st-testeando/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {product?.image_url ? (
                        <img src={product.image_url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-muted">
                          <AlertCircle size={16} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {product?.name ?? row.name}
                        </div>
                        <div className="mt-0.5 text-xs text-muted">
                          {row.name !== (product?.name ?? row.name) && (
                            <span className="italic">en captura: "{row.name}"</span>
                          )}
                          {!row.productId && (
                            <span>Sin asignar a un producto de tu lista</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setPickingForIndex(i)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
                      >
                        {row.productId ? 'Cambiar' : 'Asignar…'}
                      </button>
                      {row.productId && (
                        <button
                          onClick={() => {
                            setMatched((cur) =>
                              cur.map((r, idx) => (idx === i ? { ...r, productId: null, autoMatched: false } : r)),
                            )
                          }}
                          className="rounded-lg p-1 text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                          aria-label="Quitar asignación"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <Field label="Ventas" value={row.units} onChange={(v) => updateField(i, 'units', v)} />
                      <Field label="GMV (€)" value={row.gmv} step={0.01} onChange={(v) => updateField(i, 'gmv', v)} />
                      <Field label="Vistas" value={row.views} onChange={(v) => updateField(i, 'views', v)} />
                    </div>
                  </div>
                )
              })}
            </div>

            {stage === 'applying' && (
              <div className="flex items-center justify-center gap-2 pt-1 text-sm text-muted">
                <Loader2 size={14} className="animate-spin" /> Guardando…
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Selector para asignar manualmente */}
      <ProductPickerModal
        open={pickingForIndex !== null}
        onClose={() => setPickingForIndex(null)}
        products={products}
        value={pickingForIndex !== null ? matched[pickingForIndex]?.productId ?? null : null}
        onPick={(pid) => {
          if (pickingForIndex === null) return
          setMatched((cur) =>
            cur.map((r, idx) => (idx === pickingForIndex ? { ...r, productId: pid, autoMatched: false } : r)),
          )
        }}
        title="Asignar a un producto"
      />
    </>
  )

  function updateField(index: number, key: 'units' | 'gmv' | 'views', value: number) {
    setMatched((cur) =>
      cur.map((r, idx) => (idx === index ? { ...r, [key]: Math.max(0, value || 0) } : r)),
    )
  }
}

function Field({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted">{label}</span>
      <input
        type="number"
        min={0}
        step={step}
        value={value || ''}
        placeholder="0"
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="rounded-lg border hairline bg-transparent px-2 py-1.5 text-right text-sm tnum outline-none focus:border-brand/60"
      />
    </label>
  )
}
