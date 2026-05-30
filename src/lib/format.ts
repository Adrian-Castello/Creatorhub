export function eur(n: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n)
}

export function eurCompact(n: number): string {
  if (n === 0) return '0 €'
  // 1.000+ se abrevia (1k, 15k, 350k). 1M+ con un decimal (2,2M).
  // Por debajo de 1000 se muestra entero (15 €, 350 €).
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v.toFixed(1).replace('.', ',').replace(',0', '')}M €`
  }
  if (n >= 1000) {
    return `${Math.floor(n / 1000)}k €`
  }
  return `${Math.round(n)} €`
}

export function num(n: number): string {
  return new Intl.NumberFormat('es-ES').format(n)
}

export function numCompact(n: number): string {
  if (n < 1000) return String(n)
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v.toFixed(1).replace('.', ',').replace(',0', '')}M`
  }
  return `${Math.floor(n / 1000)}K`
}

export function pct(n: number): string {
  return `${n.toFixed(1).replace('.0', '')}%`
}

export function signedPct(n: number): string {
  const s = n >= 0 ? '+' : ''
  return `${s}${n.toFixed(1)}%`
}
