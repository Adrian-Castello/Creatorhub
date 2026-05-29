import { useEffect, useState } from 'react'

const COLORS = ['#8B5CF6', '#22D3EE', '#22C55E', '#F59E0B', '#A78BFA']

interface Piece {
  id: number
  left: number
  delay: number
  color: string
}

export function Confetti({ fire }: { fire: number }) {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    if (fire === 0) return
    const next: Piece[] = Array.from({ length: 24 }, (_, i) => ({
      id: fire * 100 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      color: COLORS[i % COLORS.length],
    }))
    setPieces(next)
    const t = setTimeout(() => setPieces([]), 1200)
    return () => clearTimeout(t)
  }, [fire])

  if (pieces.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
