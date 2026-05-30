// Cliente para enviar capturas de TikTok Shop a Claude y extraer
// ventas + visualizaciones por producto en formato JSON.

const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY as string | undefined
const MODEL = 'claude-haiku-4-5-20251001' // rápido y barato, suficiente para OCR estructurado

export const anthropicConfigured = Boolean(API_KEY)

export interface ExtractedRow {
  /** Nombre del producto tal como aparece en la captura */
  name: string
  /** Unidades vendidas */
  units: number
  /** GMV en euros (puede tener decimales) */
  gmv: number
  /** Visualizaciones del día para ese producto */
  views: number
}

export interface ExtractedReport {
  /** Filas detectadas en la captura */
  rows: ExtractedRow[]
  /** Totales del día tal y como aparecen en el resumen (si los hay) */
  totals?: {
    gmv?: number
    units?: number
    views?: number
  }
  /** Rango de fechas detectado, si se ve en la captura (puede no haber) */
  dateRangeText?: string
  /** Notas o problemas detectados que el usuario debería revisar */
  warnings?: string[]
}

const SYSTEM_PROMPT = `Eres un OCR especializado en extraer datos de capturas del panel de TikTok Shop ("Rendimiento de productos").

Tu única tarea es devolver un JSON con los datos del desglose por producto.

REGLAS ABSOLUTAS:
- Responde EXCLUSIVAMENTE con JSON válido (sin markdown, sin texto previo ni posterior, sin backticks).
- No inventes datos. Si un campo no aparece en la captura, ponlo a 0.
- Para los números: usa el punto como separador decimal y NO uses separador de miles. Ejemplo: "29,34 €" → 29.34, "3.827" → 3827.
- Si ves productos con 0 visualizaciones que el panel haya excluido del desglose, NO los inventes.
- Si la captura no es de TikTok Shop o no puedes leer nada, devuelve {"rows": [], "warnings": ["No se reconoce el panel"]}.

Estructura JSON exacta:
{
  "rows": [
    { "name": "Helados Yogoice", "units": 1, "gmv": 29.34, "views": 3827 }
  ],
  "totals": { "gmv": 80.82, "units": 3, "views": 4732 },
  "dateRangeText": "16 may 2026 – 17 may 2026",
  "warnings": []
}`

const USER_PROMPT = `Analiza esta captura del panel "Rendimiento de productos" de TikTok Shop. Extrae el desglose por producto en JSON siguiendo las reglas del sistema.`

/**
 * Convierte un File a base64 (sin el prefijo data:...;base64,).
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      const result = r.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    r.onerror = () => reject(new Error('No se pudo leer la imagen'))
    r.readAsDataURL(file)
  })
}

/**
 * Envía una imagen a Claude y devuelve los datos extraídos.
 */
export async function extractFromScreenshot(file: File): Promise<ExtractedReport> {
  if (!API_KEY) {
    throw new Error('Falta VITE_ANTHROPIC_KEY. Configura la clave en GitHub Actions.')
  }
  const mediaType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const base64 = await fileToBase64(file)

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: USER_PROMPT },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API Claude: ${res.status} ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data?.content?.[0]?.text as string | undefined
  if (!text) throw new Error('Respuesta vacía de Claude')

  // Limpieza defensiva por si Claude rodea con backticks o markdown
  const clean = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(clean) as ExtractedReport
    // Sanitizar números
    parsed.rows = (parsed.rows ?? []).map((r) => ({
      name: String(r.name ?? '').trim(),
      units: Math.max(0, Math.round(Number(r.units) || 0)),
      gmv: Math.max(0, Number(r.gmv) || 0),
      views: Math.max(0, Math.round(Number(r.views) || 0)),
    }))
    return parsed
  } catch (e) {
    throw new Error('No pude interpretar la respuesta de Claude como JSON')
  }
}
