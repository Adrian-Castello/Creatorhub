import { useData } from './useData'

export function useSettings() {
  const { settings, updateSettings } = useData()
  return { settings, updateSettings }
}
