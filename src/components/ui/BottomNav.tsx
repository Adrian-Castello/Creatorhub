import { NavLink } from 'react-router-dom'
import { BarChart3, CalendarDays, Home, Package, Settings } from 'lucide-react'

const links = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/ingresos', label: 'Ingresos', icon: BarChart3 },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t hairline bg-card/90 dark:bg-d-card/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-brand' : 'text-sub dark:text-d-sub'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
