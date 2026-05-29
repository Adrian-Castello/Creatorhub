import { NavLink } from 'react-router-dom'
import { BarChart3, CalendarDays, Home, Package, Settings } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { APP_NAME } from '../../lib/constants'

const links = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/ingresos', label: 'Ingresos', icon: BarChart3 },
]

export function Sidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r hairline bg-card/60 dark:bg-d-card/40 backdrop-blur px-4 py-6 sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-accent text-white">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M9 7l8 5-8 5z" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand/10 text-brand'
                  : 'text-sub dark:text-d-sub hover:bg-black/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-d-ink'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center justify-between px-1">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-sub transition-colors hover:bg-black/5 dark:text-d-sub dark:hover:bg-white/5"
        >
          <Settings size={18} />
          Ajustes
        </button>
        <ThemeToggle />
      </div>
    </aside>
  )
}
