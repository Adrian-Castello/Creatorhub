import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anonKey)

if (!supabaseConfigured) {
  // Visible warning during development; the app still renders with empty data.
  console.warn(
    '[Creatorhub] Falta configuración de Supabase. Copia .env.example a .env y rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
  )
}

// We create the client with placeholder values when unconfigured so imports
// don't crash; queries will simply fail and the hooks surface empty states.
export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key',
  {
    auth: { persistSession: false },
  },
)
