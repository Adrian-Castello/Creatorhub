export function eur(n: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n)
}

export function eurCompact(n: number): string {
  if (n === 0) return '0€'
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k€`
  return `${Math.round(n)}€`
}

export function num(n: number): string {
  return new Intl.NumberFormat('es-ES').format(n)
}

export function pct(n: number): string {
  return `${n.toFixed(1).replace('.0', '')}%`
}

export function signedPct(n: number): string {
  const s = n >= 0 ? '+' : ''
  return `${s}${n.toFixed(1)}%`
}
