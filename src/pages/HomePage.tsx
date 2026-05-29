import { useState } from 'react'
import { TodayKpis } from '../components/Home/TodayKpis'
import { TodayQuickActions } from '../components/Home/TodayQuickActions'
import { ActiveProductsList } from '../components/Home/ActiveProductsList'
import { DayModal } from '../components/Calendar/DayModal'
import { useData } from '../hooks/useData'
import { formatLongDate, todayKey } from '../lib/dates'
import { SkeletonCard } from '../components/ui/Skeleton'

export function HomePage() {
  const { settings, loading } = useData()
  const [dayOpen, setDayOpen] = useState(false)

  const greeting = settings.user_name ? `Hola, ${settings.user_name}` : 'Hola'

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{greeting}</h1>
        <p className="mt-1 text-sm capitalize text-muted">
          {formatLongDate(new Date())}
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <TodayKpis />
      )}

      <TodayQuickActions onOpenDay={() => setDayOpen(true)} />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Productos activos
        </h2>
        <ActiveProductsList />
      </section>

      <DayModal
        open={dayOpen}
        dayKey={todayKey()}
        onClose={() => setDayOpen(false)}
      />
    </div>
  )
}
