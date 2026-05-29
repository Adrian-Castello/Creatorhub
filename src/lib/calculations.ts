import type {
  DateRange,
  Granularity,
  PeriodBucket,
  Product,
  Sale,
  Video,
} from './types'
import {
  addDays,
  fromKey,
  startOfWeek,
  toKey,
} from './dates'

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** Comisión de una venta concreta. */
export function saleCommission(sale: Sale, product: Product | undefined): number {
  if (!product) return 0
  return (sale.gmv * product.commission_pct) / 100
}

/**
 * Nivel de color del día (0..5) según vídeos cumplidos vs objetivo.
 * 0 vídeos -> 0. Si no, se escala por % cumplido.
 */
export function dayColorLevel(videosCount: number, goal: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (videosCount <= 0) return 0
  const g = goal > 0 ? goal : 1
  const pct = videosCount / g
  if (pct >= 1) return 5
  if (pct >= 0.8) return 4
  if (pct >= 0.6) return 3
  if (pct >= 0.2) return videosCount >= 2 ? 2 : 1
  return 1
}

export interface DayTotals {
  gmv: number
  commission: number
  units: number
  videos: number
}

/** Totales de un día concreto (clave YYYY-MM-DD). */
export function dayTotals(
  dayKey: string,
  sales: Sale[],
  products: Product[],
  videos: Video[],
): DayTotals {
  const productMap = new Map(products.map((p) => [p.id, p]))
  let gmv = 0
  let commission = 0
  let units = 0
  for (const s of sales) {
    if (s.day_date !== dayKey) continue
    gmv += s.gmv
    units += s.units
    commission += saleCommission(s, productMap.get(s.product_id))
  }
  const videosCount = videos.filter(
    (v) => v.day_date === dayKey && v.product_id != null,
  ).length
  // Count any completed video row for the "videos done" metric of the day.
  const anyVideos = videos.filter((v) => v.day_date === dayKey).length
  void videosCount
  return { gmv, commission, units, videos: anyVideos }
}

/** Totales acumulados de un producto. */
export function productTotals(
  productId: string,
  sales: Sale[],
  videos: Video[],
  products: Product[],
): DayTotals {
  const product = products.find((p) => p.id === productId)
  let gmv = 0
  let commission = 0
  let units = 0
  for (const s of sales) {
    if (s.product_id !== productId) continue
    gmv += s.gmv
    units += s.units
    commission += saleCommission(s, product)
  }
  const videoCount = videos.filter((v) => v.product_id === productId).length
  return { gmv, commission, units, videos: videoCount }
}

function bucketKey(date: Date, granularity: Granularity): string {
  if (granularity === 'day') {
    return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
  }
  if (granularity === 'week') {
    const s = startOfWeek(date)
    return `${s.getDate()} ${MONTHS_SHORT[s.getMonth()]}`
  }
  return `${MONTHS_SHORT[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`
}

function bucketId(date: Date, granularity: Granularity): string {
  if (granularity === 'day') return toKey(date)
  if (granularity === 'week') return toKey(startOfWeek(date))
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Agregación por período con bucketing automático. */
export function aggregateByPeriod(
  sales: Sale[],
  videos: Video[],
  products: Product[],
  range: { from: Date; to: Date },
  granularity: Granularity,
): PeriodBucket[] {
  const productMap = new Map(products.map((p) => [p.id, p]))
  const buckets = new Map<string, PeriodBucket>()
  const order: string[] = []

  // Pre-seed buckets across the range so empty buckets still appear.
  let cur = new Date(range.from)
  cur.setHours(0, 0, 0, 0)
  const end = new Date(range.to)
  end.setHours(0, 0, 0, 0)
  while (cur <= end) {
    const id = bucketId(cur, granularity)
    if (!buckets.has(id)) {
      buckets.set(id, {
        bucket: bucketKey(cur, granularity),
        gmv: 0,
        commission: 0,
        units: 0,
        videos: 0,
      })
      order.push(id)
    }
    cur = addDays(cur, 1)
  }

  for (const s of sales) {
    const d = fromKey(s.day_date)
    if (d < range.from || d > range.to) continue
    const id = bucketId(d, granularity)
    const b = buckets.get(id)
    if (!b) continue
    b.gmv += s.gmv
    b.units += s.units
    b.commission += saleCommission(s, productMap.get(s.product_id))
  }

  for (const v of videos) {
    const d = fromKey(v.day_date)
    if (d < range.from || d > range.to) continue
    const id = bucketId(d, granularity)
    const b = buckets.get(id)
    if (!b) continue
    b.videos += 1
  }

  return order.map((id) => buckets.get(id)!)
}

/** Período anterior equivalente (mismo número de días, justo antes). */
export function previousPeriod(range: DateRange): DateRange {
  const spanMs = range.to.getTime() - range.from.getTime()
  const days = Math.round(spanMs / 86400000) + 1
  const to = addDays(new Date(range.from), -1)
  to.setHours(23, 59, 59, 999)
  const from = addDays(new Date(to), -(days - 1))
  from.setHours(0, 0, 0, 0)
  return { from, to }
}

/** Delta porcentual; null si previous === 0. */
export function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export interface RangeTotals {
  gmv: number
  commission: number
  units: number
  videos: number
}

export function rangeTotals(
  sales: Sale[],
  videos: Video[],
  products: Product[],
  range: DateRange,
): RangeTotals {
  const productMap = new Map(products.map((p) => [p.id, p]))
  let gmv = 0
  let commission = 0
  let units = 0
  let vids = 0
  for (const s of sales) {
    const d = fromKey(s.day_date)
    if (d < range.from || d > range.to) continue
    gmv += s.gmv
    units += s.units
    commission += saleCommission(s, productMap.get(s.product_id))
  }
  for (const v of videos) {
    const d = fromKey(v.day_date)
    if (d < range.from || d > range.to) continue
    vids += 1
  }
  return { gmv, commission, units, videos: vids }
}

export interface ProductRankRow {
  product: Product
  units: number
  gmv: number
  commission: number
  pctOfTotal: number
}

export function productRanking(
  sales: Sale[],
  products: Product[],
  range: DateRange,
): ProductRankRow[] {
  const productMap = new Map(products.map((p) => [p.id, p]))
  const acc = new Map<string, { units: number; gmv: number; commission: number }>()
  let totalGmv = 0
  for (const s of sales) {
    const d = fromKey(s.day_date)
    if (d < range.from || d > range.to) continue
    const cur = acc.get(s.product_id) ?? { units: 0, gmv: 0, commission: 0 }
    cur.units += s.units
    cur.gmv += s.gmv
    cur.commission += saleCommission(s, productMap.get(s.product_id))
    acc.set(s.product_id, cur)
    totalGmv += s.gmv
  }
  const rows: ProductRankRow[] = []
  for (const [pid, v] of acc) {
    const product = productMap.get(pid)
    if (!product) continue
    rows.push({
      product,
      units: v.units,
      gmv: v.gmv,
      commission: v.commission,
      pctOfTotal: totalGmv > 0 ? (v.gmv / totalGmv) * 100 : 0,
    })
  }
  rows.sort((a, b) => b.gmv - a.gmv)
  return rows
}
