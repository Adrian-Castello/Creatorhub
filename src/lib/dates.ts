import type { DateRange, Granularity, Period } from './types'

// All day identification uses local-time YYYY-MM-DD keys, never Date objects.

export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(): string {
  return toKey(new Date())
}

export function isSameDay(a: Date, b: Date): boolean {
  return toKey(a) === toKey(b)
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function addMonths(d: Date, n: number): Date {
  const r = new Date(d)
  r.setMonth(r.getMonth() + n)
  return r
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

// Monday-based week start
export function startOfWeek(d: Date): Date {
  const r = new Date(d)
  const day = (r.getDay() + 6) % 7 // 0 = Monday
  r.setDate(r.getDate() - day)
  r.setHours(0, 0, 0, 0)
  return r
}

export function endOfWeek(d: Date): Date {
  return addDays(startOfWeek(d), 6)
}

export function startOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

export function endOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(23, 59, 59, 999)
  return r
}

// Build the grid (Mon-Sun) covering a month, including leading/trailing days.
export function monthGridDays(monthAnchor: Date): Date[] {
  const first = startOfMonth(monthAnchor)
  const gridStart = startOfWeek(first)
  const days: Date[] = []
  // 6 weeks always for stable layout
  for (let i = 0; i < 42; i++) {
    days.push(addDays(gridStart, i))
  }
  return days
}

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const WEEKDAYS_ES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
export const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function formatMonthYear(d: Date): string {
  const m = MONTHS_ES[d.getMonth()]
  return `${m.charAt(0).toUpperCase() + m.slice(1)} ${d.getFullYear()}`
}

export function formatLongDate(d: Date): string {
  const wd = WEEKDAYS_ES[(d.getDay() + 6) % 7]
  return `${wd.charAt(0).toUpperCase() + wd.slice(1)}, ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`
}

export function formatShortDate(d: Date): string {
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()].slice(0, 3)}`
}

/** "Buenos días" / "Buenas tardes" / "Buenas noches" según la hora. */
export function greetingForHour(d: Date = new Date()): string {
  const h = d.getHours()
  // 00:00-05:59 → noche (madrugada)
  // 06:00-11:59 → días
  // 12:00-19:59 → tardes
  // 20:00-23:59 → noche
  if (h < 6) return 'Buenas noches'
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

/**
 * Frase de fecha relativa para Inicio:
 *   hoy   → "Hoy es viernes, 30 de mayo"
 *   ayer  → "Ayer fue jueves, 29 de mayo"
 *   mañana→ "Mañana será sábado, 31 de mayo"
 *   otros → "Sábado, 7 de junio"
 */
export function formatRelativeDate(d: Date): string {
  const today = new Date()
  const tk = toKey(today)
  const dk = toKey(d)
  const yk = toKey(addDays(today, -1))
  const mk = toKey(addDays(today, 1))
  const wd = WEEKDAYS_ES[(d.getDay() + 6) % 7]
  const wdCap = wd.charAt(0).toUpperCase() + wd.slice(1)
  const rest = `${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`
  if (dk === tk) return `Hoy es ${wd}, ${rest}`
  if (dk === yk) return `Ayer fue ${wd}, ${rest}`
  if (dk === mk) return `Mañana será ${wd}, ${rest}`
  return `${wdCap}, ${rest}`
}

// Resolve a Period selection into an explicit DateRange (anchored to a ref date).
export function periodRange(period: Period, ref: Date, custom?: DateRange): DateRange {
  switch (period) {
    case 'day':
      return { from: startOfDay(ref), to: endOfDay(ref) }
    case 'week':
      return { from: startOfWeek(ref), to: endOfDay(endOfWeek(ref)) }
    case 'month':
      return { from: startOfMonth(ref), to: endOfDay(endOfMonth(ref)) }
    case 'year': {
      // Año actual: del 1 de enero al 31 de diciembre
      const y = ref.getFullYear()
      return {
        from: startOfDay(new Date(y, 0, 1)),
        to: endOfDay(new Date(y, 11, 31)),
      }
    }
    case 'custom':
      return custom ?? { from: startOfDay(ref), to: endOfDay(ref) }
  }
}

export function granularityForPeriod(period: Period, range: DateRange): Granularity {
  if (period === 'day') return 'day'
  if (period === 'week') return 'day'
  if (period === 'month') return 'day'
  // custom: pick based on span
  const days = Math.round((range.to.getTime() - range.from.getTime()) / 86400000)
  if (days <= 31) return 'day'
  if (days <= 120) return 'week'
  return 'month'
}

export function keysInRange(range: DateRange): string[] {
  const keys: string[] = []
  let cur = startOfDay(range.from)
  const end = startOfDay(range.to)
  while (cur <= end) {
    keys.push(toKey(cur))
    cur = addDays(cur, 1)
  }
  return keys
}
