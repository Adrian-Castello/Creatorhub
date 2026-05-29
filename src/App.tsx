import { useState } from 'react'
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { Sidebar } from './components/ui/Sidebar'
import { BottomNav } from './components/ui/BottomNav'
import { FloatingAddButton } from './components/ui/FloatingAddButton'
import { SettingsModal } from './components/ui/SettingsModal'
import { Toaster } from './components/ui/Toaster'
import { ProductForm } from './components/Products/ProductForm'
import { DayModal } from './components/Calendar/DayModal'
import { HomePage } from './pages/HomePage'
import { CalendarPage } from './pages/CalendarPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { IncomePage } from './pages/IncomePage'
import { useData } from './hooks/useData'
import { todayKey } from './lib/dates'
import { APP_NAME } from './lib/constants'
import { AlertTriangle } from 'lucide-react'

function ConfigBanner() {
  const { configured } = useData()
  if (configured) return null
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-st-testeando/40 bg-st-testeando/10 px-4 py-3 text-sm">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-st-testeando" />
      <div>
        <p className="font-medium">Supabase no está configurado</p>
        <p className="text-muted">
          Copia <code>.env.example</code> a <code>.env</code> y rellena tus
          credenciales para guardar y cargar datos.
        </p>
      </div>
    </div>
  )
}

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [productFormOpen, setProductFormOpen] = useState(false)
  const [dayOpen, setDayOpen] = useState(false)

  // FAB context: on Products it creates a product, elsewhere opens today.
  function handleFab() {
    if (location.pathname.startsWith('/productos') && !location.pathname.includes('/productos/')) {
      setProductFormOpen(true)
    } else if (location.pathname.startsWith('/productos/')) {
      navigate('/productos')
      setProductFormOpen(true)
    } else {
      setDayOpen(true)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex-1 overflow-x-hidden px-4 pb-24 pt-6 md:px-8 md:pb-10">
        <div className="mx-auto w-full max-w-6xl">
          <ConfigBanner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/productos/:id" element={<ProductDetailPage />} />
            <Route path="/ingresos" element={<IncomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <BottomNav />
      <FloatingAddButton onClick={handleFab} />

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ProductForm open={productFormOpen} onClose={() => setProductFormOpen(false)} />
      <DayModal open={dayOpen} dayKey={todayKey()} onClose={() => setDayOpen(false)} />

      <Toaster />
    </div>
  )
}

export default function App() {
  void APP_NAME
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  )
}
