import { useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { PeriodSelector } from '../components/Income/PeriodSelector'
import { IncomeKpis } from '../components/Income/IncomeKpis'
import { IncomeChart } from '../components/Income/IncomeChart'
import { ProductsRanking } from '../components/Income/ProductsRanking'
import { DateRangePicker } from '../components/ui/DateRangePicker'
import { EmptyState } from '../components/ui/EmptyState'
import { useData } from '../hooks/useData'
import {
  aggregateByPeriod,
  previousPeriod,
  productRanking,
  rangeTotals,
} from '../lib/calculations'
import {
  endOfDay,
  granularityForPeriod,
  periodRange,
  startOfDay,
} from '../lib/dates'
import type { DateRange, Period } from '../lib/types'

export function IncomePage() {
  const { sales, videos, products } = useData()
  const [period, setPeriod] = useState<Period>('month')
  const [compare, setCompare] = useState(false)
  const [custom, setCustom] = useState<DateRange>(() => {
    const now = new Date()
    return { from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), to: endOfDay(now) }
  })

  const range = useMemo(
    () => periodRange(period, new Date(), custom),
    [period, custom],
  )
  const granularity = useMemo(
    () => granularityForPeriod(period, range),
    [period, range],
  )

  const current = rangeTotals(sales, videos, products, range)
  const prevRange = useMemo(() => previousPeriod(range), [range])
  const previous = compare ? rangeTotals(sales, videos, products, prevRange) : null

  const chartData = useMemo(
    () => aggregateByPeriod(sales, videos, products, range, granularity),
    [sales, videos, products, range, granularity],
  )
  const prevChartData = useMemo(
    () =>
      compare
        ? aggregateByPeriod(sales, videos, products, prevRange, granularity)
        : null,
    [compare, sales, videos, products, prevRange, granularity],
  )

  const ranking = useMemo(
    () => productRanking(sales, products, range),
    [sales, products, range],
  )

  const hasData = current.gmv > 0 || current.units > 0 || current.videos > 0

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ingresos</h1>
      </header>

      <div className="space-y-3">
        <PeriodSelector
          period={period}
          onPeriod={setPeriod}
          compare={compare}
          onCompare={setCompare}
        />
        {period === 'custom' && (
          <DateRangePicker
            value={custom}
            onChange={(r) =>
              setCustom({ from: startOfDay(r.from), to: endOfDay(r.to) })
            }
          />
        )}
      </div>

      <IncomeKpis current={current} previous={previous} />

      {hasData ? (
        <>
          <IncomeChart data={chartData} previous={prevChartData} />
          {ranking.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                Ranking de productos
              </h2>
              <ProductsRanking rows={ranking} />
            </section>
          )}
        </>
      ) : (
        <EmptyState
          icon={<BarChart3 size={22} />}
          title="Aún no hay ventas en este período 📊"
          description="Registra ventas desde el calendario o desde Inicio para ver tu analítica aquí."
        />
      )}
    </div>
  )
}
