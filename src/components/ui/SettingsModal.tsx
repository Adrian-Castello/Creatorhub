import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'
import { useSettings } from '../../hooks/useSettings'
import { useData } from '../../hooks/useData'
import { useThemeContext } from '../../hooks/themeContext'
import { APP_NAME, APP_VERSION } from '../../lib/constants'
import type { ThemeMode } from '../../hooks/useTheme'

interface Props {
  open: boolean
  onClose: () => void
}

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
]

export function SettingsModal({ open, onClose }: Props) {
  const { settings, updateSettings } = useSettings()
  const { products, videos, sales, notes } = useData()
  const { mode, setMode } = useThemeContext()

  const [name, setName] = useState(settings.user_name ?? '')
  const [goal, setGoal] = useState(String(settings.daily_video_goal))

  useEffect(() => {
    if (open) {
      setName(settings.user_name ?? '')
      setGoal(String(settings.daily_video_goal))
    }
  }, [open, settings])

  function save() {
    const g = Math.min(20, Math.max(1, parseInt(goal) || 5))
    updateSettings({ user_name: name.trim() || null, daily_video_goal: g })
    onClose()
  }

  function exportData() {
    const payload = {
      exported_at: new Date().toISOString(),
      app: APP_NAME,
      version: APP_VERSION,
      settings,
      products,
      videos,
      sales,
      notes: Object.values(notes),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `creatorhub-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajustes"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input
          label="Tu nombre"
          placeholder="Se usa en el saludo de Inicio"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Objetivo diario de publicaciones"
          type="number"
          min={1}
          max={20}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-muted">Tema</span>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setMode(o.value)}
                className={`rounded-xl border py-2 text-sm font-medium transition-colors ${
                  mode === o.value
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'hairline text-sub dark:text-d-sub hover:border-brand/40'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-muted">Datos</span>
          <Button variant="secondary" className="w-full" onClick={exportData}>
            <Download size={16} /> Exportar datos (JSON)
          </Button>
        </div>

        <div className="border-t hairline pt-4 text-center text-xs text-muted">
          {APP_NAME} · v{APP_VERSION}
        </div>
      </div>
    </Modal>
  )
}
