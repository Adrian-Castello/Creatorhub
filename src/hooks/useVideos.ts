import { useData } from './useData'

export function useVideos() {
  const { videos, setVideo, removeVideo } = useData()
  return { videos, setVideo, removeVideo }
}
