import { useCallback, useEffect, useState } from 'react'
import { THEME_KEY } from '../lib/constants'

export type ThemeMode = 'light' | 'dark' | 'system'

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function apply(mode: ThemeMode) {
  const dark = mode === 'dark' || (mode === 'system' && systemPrefersDark())
  document.documentElement.classList.toggle('dark', dark)
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system'
  })

  useEffect(() => {
    apply(mode)
    localStorage.setItem(THEME_KEY, mode)
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => apply('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  const toggle = useCallback(() => {
    setMode((m) => {
      const isDark =
        m === 'dark' || (m === 'system' && systemPrefersDark())
      return isDark ? 'light' : 'dark'
    })
  }, [])

  const isDark =
    mode === 'dark' || (mode === 'system' && systemPrefersDark())

  return { mode, setMode, toggle, isDark }
}
