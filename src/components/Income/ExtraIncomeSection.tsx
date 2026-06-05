import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift, Plus, Trash2, Trophy } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { useData } from '../../hooks/useData'
import { fromKey, toKey } from '../../lib/dates'
import { eur } from '../../lib/format'
import type { DateRange, ExtraIncome, ExtraIncomeKind } from '../../lib/types'

interface Props {
  range: DateRange
}

const KIND_META: Record<ExtraIncomeKind, { label: string; icon: typeof Gift; color: string }> = {
  cupon: { label: 'Cupón',  icon: Gift,   color: '#8B5CF6' }, // violeta (créditos TikTok)
  bonus: { label: 'Bonus',  icon: Trophy, color: '#EAB308' }, // dorado (premios)
}

export function ExtraIncomeSection({ range }: Props) {
  const { extraIncome, createExtraIncome, deleteExtraIncome } = useData()
  const [open, setOpen] = useState(false)

  // Filtrar por período actual
  const items = useMemo(() => {
    return extraIncome
      .filter((x) => {
        const d = fromKey(x.day_date)
        return d >= range.from && d <= range.to
      })
      .sort((a, b) => (a.day_date < b.day_date ? 1 : -1))
  }, [extraIncome, range])

  const totalCupon = items.filter((x) => x.kind === 'cupon').reduce((a, x) => a + x.amount, 0)
  const totalBonus = items.filter((x) => x.kind === 'bonus').reduce((a, x) => a + x.amount, 0)
  const total = totalCupon + totalBonus

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Ingresos extra
          </h2>
          {items.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
              <span className="text-muted">
                Cupones: <span className="font-semibold tnum" style={{ color: KIND_META.cupon.color }}>{eur(totalCupon)}</span>
              </span>
              <span className="opacity-30">·</span>
              <span className="text-muted">
                Bonus: <span className="font-semibold tnum" style={{ color: KIND_META.bonus.color }}>{eur(totalBonus)}</span>
              </span>
              <span className="opacity-30">·</span>
              <span className="font-semibold tnum text-accent">{eur(total)}</span>
            </div>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          <Plus size={14} /> Añadir
        </Button>
      </div>

      <div className="surface rounded-2xl p-4">
        {items.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted">
            Sin ingresos extra en este período.
          </div>
        ) : (
          <ul className="divide-y hairline">
            <AnimatePresence initial={false}>
              {items.map((x) => (
                <ExtraIncomeRow
                  key={x.id}
                  item={x}
                  onDelete={() => deleteExtraIncome(x.id)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <ExtraIncomeFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={async (input) => {
          await createExtraIncome(input)
          setOpen(false)
        }}
      />
    </section>
  )
}

function ExtraIncomeRow({ item, onDelete }: { item: ExtraIncome; onDelete: () => void }) {
  const meta = KIND_META[item.kind]
  const Icon = meta.icon
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{meta.label}</span>
          <span className="text-xs text-muted tnum">
            {formatShort(item.day_date)}
          </span>
        </div>
        {item.description && (
          <div className="truncate text-xs text-muted">{item.description}</div>
        )}
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-bold tnum" style={{ color: meta.color }}>
          {eur(item.amount)}
        </div>
      </div>
      <button
        onClick={onDelete}
        className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-st-descartado/10 hover:text-st-descartado"
        aria-label="Eliminar"
      >
        <Trash2 size={15} />
      </button>
    </motion.li>
  )
}

function formatShort(key: string): string {
  const d = fromKey(key)
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function ExtraIncomeFormModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (i: { day_date: string; kind: ExtraIncomeKind; amount: number; description: string }) => Promise<void>
}) {
  const [kind, setKind] = useState<ExtraIncomeKind>('cupon')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dayDate, setDayDate] = useState(toKey(new Date()))
  const [saving, setSaving] = useState(false)

  const amountNum = parseFloat(amount)
  const valid = !isNaN(amountNum) && amountNum > 0

  async function handleSave() {
    if (!valid) return
    setSaving(true)
    await onSave({
      day_date: dayDate,
      kind,
      amount: amountNum,
      description: description.trim(),
    })
    setSaving(false)
    setAmount('')
    setDescription('')
    setKind('cupon')
    setDayDate(toKey(new Date()))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo ingreso extra"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!valid || saving}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Tipo */}
        <div>
          <span className="mb-2 block text-sm font-medium text-muted">Tipo</span>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(KIND_META) as ExtraIncomeKind[]).map((k) => {
              const meta = KIND_META[k]
              const Icon = meta.icon
              const active = kind === k
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className="flex items-center gap-2 rounded-xl p-3 text-left transition-all"
                  style={{
                    backgroundColor: active ? `${meta.color}1A` : undefined,
                    borderColor: active ? meta.color : 'transparent',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                  }}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${meta.color}26`, color: meta.color }}
                  >
                    <Icon size={16} />
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: active ? meta.color : undefined }}
                  >
                    {meta.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Fecha y cantidad */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha"
            type="date"
            value={dayDate}
            onChange={(e) => setDayDate(e.target.value)}
          />
          <Input
            label="Cantidad"
            type="number"
            step="0.01"
            min={0}
            suffix="€"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50"
          />
        </div>

        {/* Descripción */}
        <Input
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={kind === 'cupon' ? 'Cupón Creator Boost' : 'Top 10 reto semanal'}
        />
      </div>
    </Modal>
  )
}
