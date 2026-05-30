import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayKpis } from '../components/Home/DayKpis'
import { DayQuickActions } from '../components/Home/DayQuickActions'
import { DayModal } from '../components/Calendar/DayModal'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useData } from '../hooks/useData'
import {
  addDays,
  formatRelativeDate,
  fromKey,
  greetingForHour,
  todayKey,
  toKey,
} from '../lib/dates'

export function HomePage() {
  const { settings, loading } = useData()
  const [selectedKey, setSelectedKey] = useState<string>(todayKey())
  const [direction, setDirection] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const greeting = greetingForHour()
  const name = settings.user_name?.trim()
  const dateLine = formatRelativeDate(fromKey(selectedKey))
  const isToday = selectedKey === todayKey()

  function goDay(delta: number) {
    setDirection(delta)
    setSelectedKey((cur) => toKey(addDays(fromKey(cur), delta)))
  }

  function goToday() {
    setDirection(0)
    setSelectedKey(todayKey())
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        {/* Flechas arriba a la izquierda */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goDay(-1)}
            aria-label="Día anterior"
            className="flex h-9 w-9 items-center justify-center rounded-xl surface transition-colors hover:border-brand/40"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => goDay(1)}
            aria-label="Día siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-xl surface transition-colors hover:border-brand/40"
          >
            <ChevronRight size={18} />
          </button>
          {!isToday && (
            <button
              onClick={goToday}
              aria-label="Volver a hoy"
              title="Volver a hoy"
              className="flex h-9 w-9 items-center justify-center rounded-xl surface text-brand transition-all hover:border-brand/40 hover:scale-105"
            >
              <CalendarCheck size={18} />
            </button>
          )}
        </div>

        {/* Saludo + fecha relativa */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}{name ? `, ${name}` : ''}
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={selectedKey}
              initial={{ opacity: 0, x: direction * 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -16 }}
              transition={{ duration: 0.22 }}
              className="mt-1 text-sm text-muted"
            >
              {dateLine}
            </motion.p>
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={selectedKey}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {loading ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <DayKpis dayKey={selectedKey} />
          )}

          <DayQuickActions
            dayKey={selectedKey}
            onOpenDay={() => setModalOpen(true)}
          />
        </motion.div>
      </AnimatePresence>

      <DayModal
        open={modalOpen}
        dayKey={selectedKey}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
