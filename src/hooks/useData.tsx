import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { DEFAULT_VIDEO_GOAL } from '../lib/constants'
import { useToast } from './useToast'
import type {
  AppSettings,
  DayNote,
  Product,
  ProductStatus,
  Sale,
  Video,
} from '../lib/types'

interface DataState {
  products: Product[]
  videos: Video[]
  sales: Sale[]
  notes: Record<string, DayNote>
  settings: AppSettings
  loading: boolean
  configured: boolean
  reload: () => Promise<void>

  // Products
  createProduct: (p: Omit<Product, 'id' | 'created_at'>) => Promise<Product | null>
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  // Videos
  setVideo: (dayKey: string, slot: number, productId: string | null) => Promise<void>
  removeVideo: (dayKey: string, slot: number) => Promise<void>

  // Sales
  upsertSale: (
    dayKey: string,
    productId: string,
    units: number,
    gmv: number,
  ) => Promise<void>
  deleteSale: (id: string) => Promise<void>

  // Notes
  saveNote: (dayKey: string, text: string) => Promise<void>

  // Settings
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>
}

const Ctx = createContext<DataState | null>(null)

const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  daily_video_goal: DEFAULT_VIDEO_GOAL,
  user_name: null,
  updated_at: new Date().toISOString(),
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { push } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [notes, setNotes] = useState<Record<string, DayNote>>({})
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    // Demo mode: load mock data for screenshots/previews.
    if (import.meta.env.VITE_DEMO === '1') {
      const demo = await import('../demo/demoData')
      setProducts(demo.demoProducts)
      setVideos(demo.demoVideos)
      setSales(demo.demoSales)
      setNotes(demo.demoNotes)
      setSettings(demo.demoSettings)
      setLoading(false)
      return
    }
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [p, v, s, n, st] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('videos').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('day_notes').select('*'),
        supabase.from('app_settings').select('*').eq('id', 1).maybeSingle(),
      ])
      if (p.error) throw p.error
      if (v.error) throw v.error
      if (s.error) throw s.error
      if (n.error) throw n.error
      setProducts((p.data as Product[]) ?? [])
      setVideos((v.data as Video[]) ?? [])
      setSales((s.data as Sale[]) ?? [])
      const noteMap: Record<string, DayNote> = {}
      ;((n.data as DayNote[]) ?? []).forEach((row) => (noteMap[row.day_date] = row))
      setNotes(noteMap)
      if (st.data) setSettings(st.data as AppSettings)
    } catch (e: any) {
      push('No se pudieron cargar los datos: ' + (e.message ?? 'error'), 'error')
    } finally {
      setLoading(false)
    }
  }, [push])

  useEffect(() => {
    reload()
  }, [reload])

  // ---- Products ----
  const createProduct = useCallback<DataState['createProduct']>(
    async (p) => {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert(p)
          .select()
          .single()
        if (error) throw error
        const created = data as Product
        setProducts((prev) => [created, ...prev])
        push('Producto creado', 'success')
        return created
      } catch (e: any) {
        push('Error al crear producto: ' + (e.message ?? ''), 'error')
        return null
      }
    },
    [push],
  )

  const updateProduct = useCallback<DataState['updateProduct']>(
    async (id, patch) => {
      const prev = products
      setProducts((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)))
      try {
        const { error } = await supabase.from('products').update(patch).eq('id', id)
        if (error) throw error
      } catch (e: any) {
        setProducts(prev)
        push('Error al actualizar: ' + (e.message ?? ''), 'error')
      }
    },
    [products, push],
  )

  const deleteProduct = useCallback<DataState['deleteProduct']>(
    async (id) => {
      const prevP = products
      const prevS = sales
      const prevV = videos
      setProducts((cur) => cur.filter((p) => p.id !== id))
      setSales((cur) => cur.filter((s) => s.product_id !== id))
      setVideos((cur) => cur.map((v) => (v.product_id === id ? { ...v, product_id: null } : v)))
      try {
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) throw error
        push('Producto eliminado', 'success')
      } catch (e: any) {
        setProducts(prevP)
        setSales(prevS)
        setVideos(prevV)
        push('Error al eliminar: ' + (e.message ?? ''), 'error')
      }
    },
    [products, sales, videos, push],
  )

  // ---- Videos ----
  const setVideo = useCallback<DataState['setVideo']>(
    async (dayKey, slot, productId) => {
      const existing = videos.find((v) => v.day_date === dayKey && v.slot === slot)
      const prev = videos
      // optimistic
      if (existing) {
        setVideos((cur) =>
          cur.map((v) =>
            v.id === existing.id ? { ...v, product_id: productId } : v,
          ),
        )
      } else {
        const temp: Video = {
          id: 'tmp-' + dayKey + '-' + slot,
          day_date: dayKey,
          slot,
          product_id: productId,
          created_at: new Date().toISOString(),
        }
        setVideos((cur) => [...cur, temp])
      }
      try {
        const { data, error } = await supabase
          .from('videos')
          .upsert(
            { day_date: dayKey, slot, product_id: productId },
            { onConflict: 'day_date,slot' },
          )
          .select()
          .single()
        if (error) throw error
        const saved = data as Video
        setVideos((cur) => {
          const filtered = cur.filter(
            (v) => !(v.day_date === dayKey && v.slot === slot),
          )
          return [...filtered, saved]
        })
      } catch (e: any) {
        setVideos(prev)
        push('Error al guardar vídeo: ' + (e.message ?? ''), 'error')
      }
    },
    [videos, push],
  )

  const removeVideo = useCallback<DataState['removeVideo']>(
    async (dayKey, slot) => {
      const prev = videos
      setVideos((cur) => cur.filter((v) => !(v.day_date === dayKey && v.slot === slot)))
      try {
        const { error } = await supabase
          .from('videos')
          .delete()
          .eq('day_date', dayKey)
          .eq('slot', slot)
        if (error) throw error
      } catch (e: any) {
        setVideos(prev)
        push('Error al eliminar vídeo: ' + (e.message ?? ''), 'error')
      }
    },
    [videos, push],
  )

  // ---- Sales ----
  const upsertSale = useCallback<DataState['upsertSale']>(
    async (dayKey, productId, units, gmv) => {
      const existing = sales.find(
        (s) => s.day_date === dayKey && s.product_id === productId,
      )
      const prev = sales
      if (existing) {
        setSales((cur) =>
          cur.map((s) => (s.id === existing.id ? { ...s, units, gmv } : s)),
        )
      } else {
        const temp: Sale = {
          id: 'tmp-' + dayKey + '-' + productId,
          day_date: dayKey,
          product_id: productId,
          units,
          gmv,
          created_at: new Date().toISOString(),
        }
        setSales((cur) => [...cur, temp])
      }
      try {
        const { data, error } = await supabase
          .from('sales')
          .upsert(
            { day_date: dayKey, product_id: productId, units, gmv },
            { onConflict: 'day_date,product_id' },
          )
          .select()
          .single()
        if (error) throw error
        const saved = data as Sale
        setSales((cur) => {
          const filtered = cur.filter(
            (s) => !(s.day_date === dayKey && s.product_id === productId),
          )
          return [...filtered, saved]
        })
      } catch (e: any) {
        setSales(prev)
        push('Error al guardar venta: ' + (e.message ?? ''), 'error')
      }
    },
    [sales, push],
  )

  const deleteSale = useCallback<DataState['deleteSale']>(
    async (id) => {
      const prev = sales
      setSales((cur) => cur.filter((s) => s.id !== id))
      try {
        if (!id.startsWith('tmp-')) {
          const { error } = await supabase.from('sales').delete().eq('id', id)
          if (error) throw error
        }
      } catch (e: any) {
        setSales(prev)
        push('Error al eliminar venta: ' + (e.message ?? ''), 'error')
      }
    },
    [sales, push],
  )

  // ---- Notes ----
  const saveNote = useCallback<DataState['saveNote']>(
    async (dayKey, text) => {
      const prev = notes
      const optimistic: DayNote = {
        day_date: dayKey,
        notes: text,
        updated_at: new Date().toISOString(),
      }
      setNotes((cur) => ({ ...cur, [dayKey]: optimistic }))
      try {
        const { error } = await supabase
          .from('day_notes')
          .upsert(
            { day_date: dayKey, notes: text, updated_at: new Date().toISOString() },
            { onConflict: 'day_date' },
          )
        if (error) throw error
      } catch (e: any) {
        setNotes(prev)
        push('Error al guardar nota: ' + (e.message ?? ''), 'error')
      }
    },
    [notes, push],
  )

  // ---- Settings ----
  const updateSettings = useCallback<DataState['updateSettings']>(
    async (patch) => {
      const prev = settings
      const next = { ...settings, ...patch, updated_at: new Date().toISOString() }
      setSettings(next)
      try {
        const { error } = await supabase
          .from('app_settings')
          .upsert({ ...next, id: 1 }, { onConflict: 'id' })
        if (error) throw error
        push('Ajustes guardados', 'success')
      } catch (e: any) {
        setSettings(prev)
        push('Error al guardar ajustes: ' + (e.message ?? ''), 'error')
      }
    },
    [settings, push],
  )

  return (
    <Ctx.Provider
      value={{
        products,
        videos,
        sales,
        notes,
        settings,
        loading,
        configured: supabaseConfigured || import.meta.env.VITE_DEMO === '1',
        reload,
        createProduct,
        updateProduct,
        deleteProduct,
        setVideo,
        removeVideo,
        upsertSale,
        deleteSale,
        saveNote,
        updateSettings,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useData() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>')
  return ctx
}
