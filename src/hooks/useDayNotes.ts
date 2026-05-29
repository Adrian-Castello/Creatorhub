import { useData } from './useData'

export function useDayNotes() {
  const { notes, saveNote } = useData()
  return { notes, saveNote }
}
