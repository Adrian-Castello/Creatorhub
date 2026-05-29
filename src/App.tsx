import {
  HashRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { Sidebar } from './components/ui/Sidebar'
import { BottomNav } from './components/ui/BottomNav'
import { Toaster } from './components/ui/Toaster'
import { HomePage } from './pages/HomePage'
import { CalendarPage } from './pages/CalendarPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { IncomePage } from './pages/IncomePage'
import { SettingsPage } from './pages/SettingsPage'
import { useData } from './hooks/useData'
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
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden px-4 pb-24 pt-6 md:px-8 md:pb-10">
        <div className="mx-auto w-full max-w-6xl">
          <ConfigBanner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/productos/:id" element={<ProductDetailPage />} />
            <Route path="/ingresos" element={<IncomePage />} />
            <Route path="/ajustes" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <BottomNav />
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  )
}
