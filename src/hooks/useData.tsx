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
  DayView,
  GoalHistory,
  Product,
  ProductStatus,
  Sale,
  Video,
  VideoType,
} from '../lib/types'
import type { ExtraIncome, ExtraIncomeKind } from '../lib/types'

interface DataState {
  products: Product[]
  videos: Video[]
  sales: Sale[]
  notes: Record<string, DayNote>
  dayViews: DayView[]
  extraIncome: ExtraIncome[]
  goalHistory: GoalHistory[]
  settings: AppSettings
  loading: boolean
  configured: boolean
  reload: () => Promise<void>

  // Products
  createProduct: (p: Omit<Product, 'id' | 'created_at'>) => Promise<Product | null>
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  // Videos
  setVideo: (
    dayKey: string,
    slot: number,
    productId: string | null,
    type?: VideoType,
  ) => Promise<void>
  removeVideo: (dayKey: string, slot: number) => Promise<void>

  // Sales
  upsertSale: (
    dayKey: string,
    productId: string,
    units: number,
    gmv: number,
  ) => Promise<void>
  deleteSale: (id: string) => Promise<void>

  // Day views (visualizaciones por producto y día)
  upsertDayView: (dayKey: string, productId: string, views: number) => Promise<void>
  deleteDayView: (id: string) => Promise<void>

  // Notes
  saveNote: (dayKey: string, text: string) => Promise<void>

  // Settings
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>

  /** Cambia el objetivo diario de publicaciones a partir del día `fromKey`. */
  setDailyGoalFrom: (fromKey: string, goal: number) => Promise<void>

  // Extra income (cupones, bonus)
  createExtraIncome: (
    input: { day_date: string; kind: ExtraIncomeKind; amount: number; description: string },
  ) => Promise<void>
  updateExtraIncome: (id: string, patch: Partial<Omit<ExtraIncome, 'id' | 'created_at'>>) => Promise<void>
  deleteExtraIncome: (id: string) => Promise<void>
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
  const [dayViews, setDayViews] = useState<DayView[]>([])
  const [extraIncome, setExtraIncome] = useState<ExtraIncome[]>([])
  const [goalHistory, setGoalHistory] = useState<GoalHistory[]>([])
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
      setDayViews(demo.demoDayViews ?? [])
      setExtraIncome(demo.demoExtraIncome ?? [])
      setGoalHistory(demo.demoGoalHistory ?? [])
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
      const [p, v, s, n, dv, ei, gh, st] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('videos').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('day_notes').select('*'),
        supabase.from('day_views').select('*'),
        supabase.from('extra_income').select('*'),
        supabase.from('goal_history').select('*'),
        supabase.from('app_settings').select('*').eq('id', 1).maybeSingle(),
      ])
      if (p.error) throw p.error
      if (v.error) throw v.error
      if (s.error) throw s.error
      if (n.error) throw n.error
      // dv y ei pueden fallar si el usuario aún no ha ejecutado las migraciones:
      // lo manejamos suavemente.
      setProducts((p.data as Product[]) ?? [])
      setVideos((v.data as Video[]) ?? [])
      setSales((s.data as Sale[]) ?? [])
      const noteMap: Record<string, DayNote> = {}
      ;((n.data as DayNote[]) ?? []).forEach((row) => (noteMap[row.day_date] = row))
      setNotes(noteMap)
      if (dv.error) {
        console.warn('day_views no disponible — ejecuta supabase-migration-v4.sql')
        setDayViews([])
      } else {
        setDayViews((dv.data as DayView[]) ?? [])
      }
      if (ei.error) {
        console.warn('extra_income no disponible — ejecuta supabase-migration-v5.sql')
        setExtraIncome([])
      } else {
        setExtraIncome((ei.data as ExtraIncome[]) ?? [])
      }
      if (gh.error) {
        console.warn('goal_history no disponible — ejecuta supabase-migration-v8.sql')
        setGoalHistory([])
      } else {
        setGoalHistory((gh.data as GoalHistory[]) ?? [])
      }
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
    async (dayKey, slot, productId, type) => {
      const existing = videos.find((v) => v.day_date === dayKey && v.slot === slot)
      const finalType: VideoType = type ?? existing?.type ?? 'video'
      const prev = videos
      // optimistic
      if (existing) {
        setVideos((cur) =>
          cur.map((v) =>
            v.id === existing.id ? { ...v, product_id: productId, type: finalType } : v,
          ),
        )
      } else {
        const temp: Video = {
          id: 'tmp-' + dayKey + '-' + slot,
          day_date: dayKey,
          slot,
          product_id: productId,
          type: finalType,
          created_at: new Date().toISOString(),
        }
        setVideos((cur) => [...cur, temp])
      }
      try {
        const { data, error } = await supabase
          .from('videos')
          .upsert(
            { day_date: dayKey, slot, product_id: productId, type: finalType },
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
        push('Error al guardar publicación: ' + (e.message ?? ''), 'error')
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
        push('Error al eliminar publicación: ' + (e.message ?? ''), 'error')
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
      const next: DayNote = {
        day_date: dayKey,
        notes: text,
        updated_at: new Date().toISOString(),
      }
      setNotes((cur) => ({ ...cur, [dayKey]: next }))
      try {
        const { error } = await supabase
          .from('day_notes')
          .upsert(next, { onConflict: 'day_date' })
        if (error) throw error
      } catch (e: any) {
        setNotes(prev)
        push('Error al guardar nota: ' + (e.message ?? ''), 'error')
      }
    },
    [notes, push],
  )

  // ---- Day views (visualizaciones por producto) ----
  const upsertDayView = useCallback<DataState['upsertDayView']>(
    async (dayKey, productId, views) => {
      const prev = dayViews
      const existing = dayViews.find(
        (v) => v.day_date === dayKey && v.product_id === productId,
      )
      const optimistic: DayView = existing
        ? { ...existing, views }
        : {
            id: 'tmp-' + Math.random().toString(36).slice(2),
            day_date: dayKey,
            product_id: productId,
            views,
            created_at: new Date().toISOString(),
          }
      setDayViews((cur) =>
        existing
          ? cur.map((v) => (v.id === existing.id ? optimistic : v))
          : [...cur, optimistic],
      )
      try {
        const { data, error } = await supabase
          .from('day_views')
          .upsert(
            { day_date: dayKey, product_id: productId, views },
            { onConflict: 'day_date,product_id' },
          )
          .select()
          .single()
        if (error) throw error
        if (data) {
          setDayViews((cur) =>
            cur.map((v) => (v.id === optimistic.id ? (data as DayView) : v)),
          )
        }
      } catch (e: any) {
        setDayViews(prev)
        push('Error al guardar visualizaciones: ' + (e.message ?? ''), 'error')
      }
    },
    [dayViews, push],
  )

  const deleteDayView = useCallback<DataState['deleteDayView']>(
    async (id) => {
      const prev = dayViews
      setDayViews((cur) => cur.filter((v) => v.id !== id))
      try {
        const { error } = await supabase.from('day_views').delete().eq('id', id)
        if (error) throw error
      } catch (e: any) {
        setDayViews(prev)
        push('Error al eliminar: ' + (e.message ?? ''), 'error')
      }
    },
    [dayViews, push],
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

  // ---- Goal history ----
  // Inserta un nuevo punto de cambio del objetivo a partir de `fromKey`.
  // Si ya existe un registro con la misma fecha, lo actualiza.
  const setDailyGoalFrom = useCallback<DataState['setDailyGoalFrom']>(
    async (fromKey, goal) => {
      if (goal <= 0) return
      const prev = goalHistory
      // optimistic
      const existing = goalHistory.find((g) => g.day_date === fromKey)
      const optimistic: GoalHistory = existing
        ? { ...existing, goal }
        : { id: 'tmp-' + fromKey, day_date: fromKey, goal, created_at: new Date().toISOString() }
      setGoalHistory((cur) =>
        existing
          ? cur.map((g) => (g.id === existing.id ? optimistic : g))
          : [...cur, optimistic],
      )

      let goalHistorySaved = true
      try {
        if (existing) {
          const { data, error } = await supabase
            .from('goal_history')
            .update({ goal })
            .eq('id', existing.id)
            .select()
            .single()
          if (error) throw error
          setGoalHistory((cur) =>
            cur.map((g) => (g.id === existing.id ? (data as GoalHistory) : g)),
          )
        } else {
          const { data, error } = await supabase
            .from('goal_history')
            .insert({ day_date: fromKey, goal })
            .select()
            .single()
          if (error) throw error
          setGoalHistory((cur) =>
            cur.map((g) => (g.id === optimistic.id ? (data as GoalHistory) : g)),
          )
        }
      } catch (e: any) {
        // ¿La tabla no existe todavía? Avisa al usuario para ejecutar la migración
        // y sigue con el guardado en app_settings (no rompemos toda la app).
        goalHistorySaved = false
        setGoalHistory(prev)
        const msg = (e?.message ?? '').toLowerCase()
        if (msg.includes('goal_history') || msg.includes('not find')) {
          push(
            'Para guardar histórico de objetivos, ejecuta la migración v8 en Supabase.',
            'error',
          )
        } else {
          push('Error al guardar el histórico: ' + (e.message ?? ''), 'error')
        }
      }

      // Siempre intentamos actualizar app_settings con el objetivo "actual"
      // así, aunque falle goal_history, el valor que ves en Ajustes y los días
      // futuros usarán el nuevo objetivo.
      try {
        await supabase
          .from('app_settings')
          .upsert(
            { id: 1, daily_video_goal: goal, updated_at: new Date().toISOString() },
            { onConflict: 'id' },
          )
        setSettings((s) => ({ ...s, daily_video_goal: goal }))
        if (goalHistorySaved) {
          push('Objetivo actualizado', 'success')
        }
      } catch (e: any) {
        push('Error al guardar ajustes: ' + (e.message ?? ''), 'error')
      }
    },
    [goalHistory, push],
  )

  // ---- Extra income (cupones, bonus) ----
  const createExtraIncome = useCallback<DataState['createExtraIncome']>(
    async (input) => {
      try {
        const { data, error } = await supabase
          .from('extra_income')
          .insert({
            day_date: input.day_date,
            kind: input.kind,
            amount: input.amount,
            description: input.description ?? '',
          })
          .select()
          .single()
        if (error) throw error
        setExtraIncome((cur) => [...cur, data as ExtraIncome])
      } catch (e: any) {
        push('Error al guardar: ' + (e.message ?? ''), 'error')
      }
    },
    [push],
  )

  const updateExtraIncome = useCallback<DataState['updateExtraIncome']>(
    async (id, patch) => {
      const prev = extraIncome
      setExtraIncome((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x)))
      try {
        const { error } = await supabase
          .from('extra_income')
          .update(patch)
          .eq('id', id)
        if (error) throw error
      } catch (e: any) {
        setExtraIncome(prev)
        push('Error al actualizar: ' + (e.message ?? ''), 'error')
      }
    },
    [extraIncome, push],
  )

  const deleteExtraIncome = useCallback<DataState['deleteExtraIncome']>(
    async (id) => {
      const prev = extraIncome
      setExtraIncome((cur) => cur.filter((x) => x.id !== id))
      try {
        const { error } = await supabase.from('extra_income').delete().eq('id', id)
        if (error) throw error
      } catch (e: any) {
        setExtraIncome(prev)
        push('Error al eliminar: ' + (e.message ?? ''), 'error')
      }
    },
    [extraIncome, push],
  )

  return (
    <Ctx.Provider
      value={{
        products,
        videos,
        sales,
        notes,
        dayViews,
        extraIncome,
        goalHistory,
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
        upsertDayView,
        deleteDayView,
        saveNote,
        updateSettings,
        setDailyGoalFrom,
        createExtraIncome,
        updateExtraIncome,
        deleteExtraIncome,
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
