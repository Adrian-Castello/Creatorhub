import { useEffect, useState } from 'react'
import { Moon, Palette, Sun, Target, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useSettings } from '../hooks/useSettings'
import { useData } from '../hooks/useData'
import { useThemeContext } from '../hooks/themeContext'
import { todayKey } from '../lib/dates'
import type { ThemeMode } from '../hooks/useTheme'

const themeOptions: { value: ThemeMode; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Palette },
]

export function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const { setDailyGoalFrom } = useData()
  const { mode, setMode } = useThemeContext()

  const [name, setName] = useState(settings.user_name ?? '')
  const [goal, setGoal] = useState(String(settings.daily_video_goal))
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setName(settings.user_name ?? '')
    setGoal(String(settings.daily_video_goal))
    setDirty(false)
  }, [settings])

  useEffect(() => {
    const nameChanged = (name.trim() || null) !== (settings.user_name ?? null)
    const goalChanged = parseInt(goal) !== settings.daily_video_goal
    setDirty(nameChanged || goalChanged)
  }, [name, goal, settings])

  async function save() {
    const g = Math.min(20, Math.max(1, parseInt(goal) || 5))
    const nameValue = name.trim() || null
    const goalChanged = g !== settings.daily_video_goal
    // Si solo cambió el nombre, no toques el objetivo (no metas registro nuevo)
    if (!goalChanged) {
      updateSettings({ user_name: nameValue })
      return
    }
    // Cambio de objetivo: se guarda en goal_history aplicando desde HOY,
    // los días anteriores conservan el objetivo que tuvieran.
    if (nameValue !== (settings.user_name ?? null)) {
      updateSettings({ user_name: nameValue })
    }
    await setDailyGoalFrom(todayKey(), g)
  }

  const stickyBar = dirty ? (
    <div className="sticky bottom-20 md:bottom-4 z-30 flex justify-end">
      <div className="flex items-center gap-3 rounded-2xl border hairline bg-card dark:bg-d-card px-4 py-3 shadow-soft-lg">
        <span className="text-sm text-muted">Cambios sin guardar</span>
        <Button size="sm" onClick={save}>Guardar</Button>
      </div>
    </div>
  ) : null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ajustes</h1>
        <p className="mt-1 text-sm text-muted">Personaliza tu experiencia.</p>
      </header>

      <section className="surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-muted">
          <User size={16} />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Personal</h2>
        </div>
        <Input
          label="Tu nombre"
          placeholder="Se usa en el saludo de Inicio"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </section>

      <section className="surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-muted">
          <Target size={16} />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Objetivos</h2>
        </div>
        <Input
          label="Objetivo diario de videos"
          type="number"
          min={1}
          max={20}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <p className="text-xs text-muted">
          El calendario y los KPIs se calculan en base a este objetivo.
        </p>
      </section>

      <section className="surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-muted">
          <Palette size={16} />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Apariencia</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((o) => {
            const Icon = o.icon
            const active = mode === o.value
            return (
              <button
                key={o.value}
                onClick={() => setMode(o.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border py-4 text-sm font-medium transition-colors ${
                  active
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'hairline text-sub dark:text-d-sub hover:border-brand/40'
                }`}
              >
                <Icon size={20} />
                {o.label}
              </button>
            )
          })}
        </div>
      </section>

      {stickyBar}
    </div>
  )
}
