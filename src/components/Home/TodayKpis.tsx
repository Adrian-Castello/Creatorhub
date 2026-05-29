import { CheckCircle2, Coins, Package, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useData } from '../../hooks/useData'
import { dayTotals, dayColorLevel } from '../../lib/calculations'
import { COLOR_LEVELS } from '../../lib/constants'
import { todayKey } from '../../lib/dates'
import { eur, num } from '../../lib/format'
import { useThemeContext } from '../../hooks/themeContext'

export function TodayKpis() {
  const { sales, videos, products, settings } = useData()
  const { isDark } = useThemeContext()
  const key = todayKey()
  const goal = settings.daily_video_goal

  const totals = dayTotals(key, sales, products, videos)
  const level = dayColorLevel(totals.videos, goal)
  const levelColor = isDark ? COLOR_LEVELS[level].dark : COLOR_LEVELS[level].light
  const activeCount = products.filter((p) => p.status === 'activo').length
  const progress = Math.min(100, (totals.videos / Math.max(1, goal)) * 100)

  const cards = [
    {
      label: 'Vídeos de hoy',
      value: `${totals.videos} / ${goal}`,
      icon: CheckCircle2,
      progress,
      progressColor: levelColor,
    },
    {
      label: 'GMV del día',
      value: eur(totals.gmv),
      icon: TrendingUp,
      accent: 'text-brand',
    },
    {
      label: 'Comisión del día',
      value: eur(totals.commission),
      icon: Coins,
      accent: 'text-accent',
    },
    {
      label: 'Productos activos',
      value: num(activeCount),
      icon: Package,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="surface rounded-2xl p-4 min-w-0"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">{c.label}</span>
            <c.icon size={16} className="text-muted" />
          </div>
          <div className={`text-2xl font-bold tnum ${c.accent ?? ''}`}>
            {c.value}
          </div>
          {c.progress !== undefined && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: c.progressColor }}
                initial={{ width: 0 }}
                animate={{ width: `${c.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
