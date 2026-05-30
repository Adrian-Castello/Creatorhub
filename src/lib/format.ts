export function eur(n: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n)
}

export function eurCompact(n: number): string {
  if (n === 0) return '0 €'
  // Entero redondeado con separador de miles (es-ES usa punto: 1.000, 12.345)
  return `${new Intl.NumberFormat('es-ES').format(Math.round(n))} €`
}

export function num(n: number): string {
  return new Intl.NumberFormat('es-ES').format(n)
}

export function numCompact(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace('.0', '')}K`
  return `${(n / 1_000_000).toFixed(1).replace('.0', '')}M`
}

export function pct(n: number): string {
  return `${n.toFixed(1).replace('.0', '')}%`
}

export function signedPct(n: number): string {
  const s = n >= 0 ? '+' : ''
  return `${s}${n.toFixed(1)}%`
}
