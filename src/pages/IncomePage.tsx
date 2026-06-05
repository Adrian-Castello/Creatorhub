import { useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { PeriodSelector } from '../components/Income/PeriodSelector'
import { IncomeKpis } from '../components/Income/IncomeKpis'
import { ProductsRanking } from '../components/Income/ProductsRanking'
import { ExtraIncomeSection } from '../components/Income/ExtraIncomeSection'
import { DateRangePicker } from '../components/ui/DateRangePicker'
import { EmptyState } from '../components/ui/EmptyState'
import { useData } from '../hooks/useData'
import { previousPeriod, productRanking, rangeTotals } from '../lib/calculations'
import { endOfDay, fromKey, periodRange, startOfDay } from '../lib/dates'
import type { DateRange, Period } from '../lib/types'

export function IncomePage() {
  const { sales, videos, products, extraIncome } = useData()
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

  // Totales de comisión / GMV / etc (de productos)
  const current = rangeTotals(sales, videos, products, range)
  const prevRange = useMemo(() => previousPeriod(range), [range])
  const previous = compare ? rangeTotals(sales, videos, products, prevRange) : null

  // Extras del período (cupones + bonus)
  const extrasInRange = useMemo(
    () =>
      extraIncome.filter((x) => {
        const d = fromKey(x.day_date)
        return d >= range.from && d <= range.to
      }),
    [extraIncome, range],
  )
  const extrasTotal = useMemo(
    () => extrasInRange.reduce((a, x) => a + x.amount, 0),
    [extrasInRange],
  )
  // Solo los bonus se cuentan como ingreso real (los cupones son crédito interno)
  const bonusTotal = useMemo(
    () => extrasInRange.filter((x) => x.kind === 'bonus').reduce((a, x) => a + x.amount, 0),
    [extrasInRange],
  )

  const prevExtrasTotal = useMemo(() => {
    if (!previous) return 0
    return extraIncome
      .filter((x) => {
        const d = fromKey(x.day_date)
        return d >= prevRange.from && d <= prevRange.to
      })
      .reduce((a, x) => a + x.amount, 0)
  }, [extraIncome, prevRange, previous])

  const prevBonusTotal = useMemo(() => {
    if (!previous) return 0
    return extraIncome
      .filter((x) => {
        if (x.kind !== 'bonus') return false
        const d = fromKey(x.day_date)
        return d >= prevRange.from && d <= prevRange.to
      })
      .reduce((a, x) => a + x.amount, 0)
  }, [extraIncome, prevRange, previous])

  const ranking = useMemo(
    () => productRanking(sales, products, range),
    [sales, products, range],
  )

  const hasData =
    current.gmv > 0 || current.units > 0 || current.videos > 0 || extrasTotal > 0

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

      <IncomeKpis
        current={current}
        previous={previous}
        bonusTotal={bonusTotal}
        prevBonusTotal={prevBonusTotal}
      />

      {hasData ? (
        <>
          {ranking.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                Ranking de productos
              </h2>
              <ProductsRanking rows={ranking} />
            </section>
          )}

          <ExtraIncomeSection range={range} />
        </>
      ) : (
        <>
          <EmptyState
            icon={<BarChart3 size={22} />}
            title="Aún no hay ventas en este período 📊"
            description="Registra ventas desde el calendario o desde Inicio para ver tu analítica aquí."
          />
          <ExtraIncomeSection range={range} />
        </>
      )}
    </div>
  )
}
