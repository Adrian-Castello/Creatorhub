import { createContext, useContext, type ReactNode } from 'react'
import { useTheme, type ThemeMode } from './useTheme'

interface ThemeCtx {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  toggle: () => void
  isDark: boolean
}

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme()
  return <Ctx.Provider value={theme}>{children}</Ctx.Provider>
}

export function useThemeContext() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useThemeContext debe usarse dentro de <ThemeProvider>')
  return ctx
}
