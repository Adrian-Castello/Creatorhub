import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Gift, Plus, Trash2, Trophy } from 'lucide-react'
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

const KIND_META: Record<
  ExtraIncomeKind,
  {
    label: string
    labelSingular: string
    icon: typeof Gift
    color: string
    gradient: string
    sublabel: string
  }
> = {
  cupon: {
    label: 'Cupones',
    labelSingular: 'Cupón',
    icon: Gift,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    sublabel: 'Crédito en tienda',
  },
  bonus: {
    label: 'Bonus',
    labelSingular: 'Bonus',
    icon: Trophy,
    color: '#EAB308',
    gradient: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
    sublabel: 'Premios en efectivo',
  },
}

export function ExtraIncomeSection({ range }: Props) {
  const { extraIncome, createExtraIncome, deleteExtraIncome } = useData()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<ExtraIncomeKind | null>(null)

  const items = useMemo(() => {
    return extraIncome
      .filter((x) => {
        const d = fromKey(x.day_date)
        return d >= range.from && d <= range.to
      })
      .sort((a, b) => (a.day_date < b.day_date ? 1 : -1))
  }, [extraIncome, range])

  const cuponItems = items.filter((x) => x.kind === 'cupon')
  const bonusItems = items.filter((x) => x.kind === 'bonus')
  const totalCupon = cuponItems.reduce((a, x) => a + x.amount, 0)
  const totalBonus = bonusItems.reduce((a, x) => a + x.amount, 0)

  function toggle(kind: ExtraIncomeKind) {
    setExpanded((cur) => (cur === kind ? null : kind))
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Ingresos extra
        </h2>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          <Plus size={14} /> Añadir
        </Button>
      </div>

      {/* Hero: dos cards */}
      <div className="grid grid-cols-2 gap-3">
        <HeroCard
          kind="cupon"
          total={totalCupon}
          items={cuponItems}
          expanded={expanded === 'cupon'}
          onToggle={() => toggle('cupon')}
        />
        <HeroCard
          kind="bonus"
          total={totalBonus}
          items={bonusItems}
          expanded={expanded === 'bonus'}
          onToggle={() => toggle('bonus')}
        />
      </div>

      {/* Lista — solo cuando alguna sección está expandida */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key={expanded}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ExpandedList
              items={expanded === 'cupon' ? cuponItems : bonusItems}
              kind={expanded}
              onDelete={(id) => deleteExtraIncome(id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

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

function HeroCard({
  kind,
  total,
  items,
  expanded,
  onToggle,
}: {
  kind: ExtraIncomeKind
  total: number
  items: ExtraIncome[]
  expanded: boolean
  onToggle: () => void
}) {
  const meta = KIND_META[kind]
  const Icon = meta.icon
  const empty = items.length === 0
  const count = items.length

  return (
    <motion.button
      whileHover={{ y: empty ? 0 : -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={empty ? undefined : onToggle}
      disabled={empty}
      className="group relative overflow-hidden rounded-2xl p-4 text-left sm:p-5"
      style={{
        background: empty
          ? `linear-gradient(135deg, ${meta.color}0F 0%, ${meta.color}05 100%)`
          : meta.gradient,
        boxShadow: empty ? undefined : `0 8px 24px -8px ${meta.color}50`,
        // borde uniforme — sin pseudo-elementos que generaban el "pico gris"
        border: empty ? `1px dashed ${meta.color}55` : 'none',
        cursor: empty ? 'default' : 'pointer',
      }}
    >
      {/* Brillos sólo cuando hay datos (con gradient activo) */}
      {!empty && (
        <>
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-25 blur-2xl"
            style={{ backgroundColor: '#FFFFFF' }}
          />
          <div
            className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full opacity-15 blur-2xl"
            style={{ backgroundColor: '#000000' }}
          />
        </>
      )}

      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            empty ? '' : 'bg-white/20 backdrop-blur-sm'
          }`}
          style={empty ? { backgroundColor: `${meta.color}1A`, color: meta.color } : undefined}
        >
          <Icon size={20} className={empty ? '' : 'text-white'} strokeWidth={2.2} />
        </div>
        {!empty && (
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white"
          >
            <ChevronDown size={15} strokeWidth={2.5} />
          </motion.span>
        )}
      </div>

      <div className="relative mt-3">
        <div
          className={`text-xs font-medium uppercase tracking-wide ${
            empty ? '' : 'text-white/80'
          }`}
          style={empty ? { color: meta.color, opacity: 0.85 } : undefined}
        >
          {meta.label}
        </div>
        <div
          className={`mt-0.5 text-2xl font-bold tnum tracking-tight ${
            empty ? '' : 'text-white drop-shadow-sm'
          }`}
          style={empty ? { color: meta.color, opacity: 0.4 } : undefined}
        >
          {empty ? '0 €' : eur(total)}
        </div>
        <div
          className={`mt-0.5 text-[11px] ${empty ? 'text-muted' : 'text-white/75'}`}
        >
          {empty
            ? meta.sublabel
            : `${count} ${count === 1 ? meta.labelSingular.toLowerCase() : meta.label.toLowerCase()}`}
        </div>
      </div>
    </motion.button>
  )
}

function ExpandedList({
  items,
  kind,
  onDelete,
}: {
  items: ExtraIncome[]
  kind: ExtraIncomeKind
  onDelete: (id: string) => void
}) {
  const meta = KIND_META[kind]

  if (items.length === 0) return null

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: `${meta.color}08`,
        border: `1px solid ${meta.color}25`,
      }}
    >
      <ul>
        <AnimatePresence initial={false}>
          {items.map((x, i) => (
            <ExtraIncomeRow
              key={x.id}
              item={x}
              meta={meta}
              onDelete={() => onDelete(x.id)}
              isLast={i === items.length - 1}
            />
          ))}
        </AnimatePresence>
      </ul>
      {kind === 'cupon' && (
        <p
          className="px-4 py-2.5 text-[11px] leading-snug"
          style={{
            color: meta.color,
            opacity: 0.7,
            borderTop: `1px solid ${meta.color}20`,
          }}
        >
          Los cupones no se suman a tus ingresos totales, ya que solo pueden gastarse dentro de TikTok Shop.
        </p>
      )}
    </div>
  )
}

function ExtraIncomeRow({
  item,
  meta,
  onDelete,
  isLast,
}: {
  item: ExtraIncome
  meta: typeof KIND_META[ExtraIncomeKind]
  onDelete: () => void
  isLast: boolean
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 px-4 py-3"
      style={isLast ? undefined : { borderBottom: `1px solid ${meta.color}15` }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">
            {item.description || meta.labelSingular}
          </span>
        </div>
        <div className="text-xs text-muted tnum">{formatShort(item.day_date)}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-base font-bold tnum" style={{ color: meta.color }}>
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
                <motion.button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  whileTap={{ scale: 0.97 }}
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
                    {meta.labelSingular}
                  </span>
                </motion.button>
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
