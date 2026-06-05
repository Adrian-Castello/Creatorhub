export type ProductStatus =
  | 'solicitado'
  | 'recibido'
  | 'testeando'
  | 'activo'
  | 'descartado'

export interface Product {
  id: string
  name: string
  image_url: string | null
  commission_pct: number
  price: number
  status: ProductStatus
  created_at: string
}

export type VideoType = 'video' | 'carrusel'

export interface Video {
  id: string
  day_date: string // YYYY-MM-DD
  slot: number
  product_id: string | null
  type: VideoType
  created_at: string
}

export interface Sale {
  id: string
  day_date: string // YYYY-MM-DD
  product_id: string
  units: number
  gmv: number
  created_at: string
}

export interface DayNote {
  day_date: string
  notes: string
  updated_at: string
}

export interface DayView {
  id: string
  day_date: string // YYYY-MM-DD
  product_id: string
  views: number
  created_at: string
}

export type ExtraIncomeKind = 'cupon' | 'bonus'

export interface ExtraIncome {
  id: string
  day_date: string // YYYY-MM-DD
  kind: ExtraIncomeKind
  amount: number
  description: string
  created_at: string
}

export interface AppSettings {
  id: number
  daily_video_goal: number
  user_name: string | null
  updated_at: string
}

export type Granularity = 'day' | 'week' | 'month'
export type Period = 'day' | 'week' | 'month' | 'year' | 'custom'

export interface DateRange {
  from: Date
  to: Date
}

export interface PeriodBucket {
  bucket: string
  gmv: number
  commission: number
  units: number
  videos: number
}
