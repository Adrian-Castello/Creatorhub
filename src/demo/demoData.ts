import type { AppSettings, DayNote, Product, Sale, Video } from '../lib/types'
import { toKey } from '../lib/dates'

// Demo seed used ONLY when VITE_DEMO=1 (for screenshots / previews).

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toKey(d)
}

// Instant-loading inline SVG gradient "product photos" (no network needed).
function img(c1: string, c2: string, label: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/>
    </linearGradient></defs>
    <rect width='600' height='450' fill='url(#g)'/>
    <text x='50%' y='52%' font-family='Inter,sans-serif' font-size='44' font-weight='700'
      fill='rgba(255,255,255,0.92)' text-anchor='middle'>${label}</text>
  </svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

export const demoProducts: Product[] = [
  { id: 'p1', name: 'Mini proyector portátil 4K', image_url: img('#8B5CF6', '#6D28D9', 'Proyector'), commission_pct: 14.5, price: 49.99, status: 'activo', created_at: daysAgo(40) },
  { id: 'p2', name: 'Auriculares inalámbricos ANC', image_url: img('#06B6D4', '#0E7490', 'Auriculares'), commission_pct: 12, price: 29.9, status: 'activo', created_at: daysAgo(35) },
  { id: 'p3', name: 'Lámpara LED de escritorio RGB', image_url: img('#F59E0B', '#B45309', 'Lámpara'), commission_pct: 18, price: 19.99, status: 'testeando', created_at: daysAgo(20) },
  { id: 'p4', name: 'Organizador de cables magnético', image_url: img('#10B981', '#047857', 'Cables'), commission_pct: 22.5, price: 9.99, status: 'activo', created_at: daysAgo(28) },
  { id: 'p5', name: 'Botella térmica acero 750ml', image_url: img('#64748B', '#334155', 'Botella'), commission_pct: 15, price: 24.5, status: 'recibido', created_at: daysAgo(50) },
  { id: 'p6', name: 'Soporte de móvil para coche', image_url: img('#EC4899', '#9D174D', 'Soporte'), commission_pct: 20, price: 14.99, status: 'testeando', created_at: daysAgo(12) },
  { id: 'p7', name: 'Teclado mecánico 60% RGB', image_url: img('#3B82F6', '#1D4ED8', 'Teclado'), commission_pct: 10.5, price: 59.0, status: 'solicitado', created_at: daysAgo(5) },
  { id: 'p8', name: 'Funda silicona AirPods Pro', image_url: img('#EF4444', '#991B1B', 'Funda'), commission_pct: 25, price: 7.99, status: 'descartado', created_at: daysAgo(60) },
]

const videos: Video[] = []
let vid = 1
for (let d = 0; d < 40; d++) {
  const key = daysAgo(d)
  const count = [5, 4, 5, 3, 5, 2, 0, 4, 5, 5, 1, 3, 5, 4][d % 14]
  const pool = ['p1', 'p2', 'p3', 'p4', 'p6']
  for (let s = 1; s <= count; s++) {
    videos.push({ id: 'v' + vid++, day_date: key, slot: s, product_id: pool[(d + s) % pool.length], created_at: key })
  }
}
export const demoVideos = videos

const sales: Sale[] = []
let sid = 1
for (let d = 0; d < 40; d++) {
  const key = daysAgo(d)
  const sellers = ['p1', 'p2', 'p4']
  if (d % 7 === 6) continue
  for (const pid of sellers) {
    const base = pid === 'p1' ? 3 : pid === 'p2' ? 5 : 8
    const units = Math.max(0, base + ((d * 7) % 6) - 2)
    if (units === 0) continue
    const product = demoProducts.find((p) => p.id === pid)!
    sales.push({ id: 's' + sid++, day_date: key, product_id: pid, units, gmv: +(units * product.price).toFixed(2), created_at: key })
  }
}
export const demoSales = sales

export const demoNotes: Record<string, DayNote> = {
  [daysAgo(0)]: { day_date: daysAgo(0), notes: '', visits: 12450, updated_at: daysAgo(0) },
  [daysAgo(1)]: { day_date: daysAgo(1), notes: 'El proyector volvió a despuntar. Probar nuevo hook en el vídeo 3.', visits: 8930, updated_at: daysAgo(1) },
  [daysAgo(2)]: { day_date: daysAgo(2), notes: '', visits: 15200, updated_at: daysAgo(2) },
}

export const demoSettings: AppSettings = { id: 1, daily_video_goal: 5, user_name: 'Adrián', updated_at: new Date().toISOString() }
