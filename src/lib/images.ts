import { supabase } from './supabase'
import { IMAGE_BUCKET } from './constants'

const MAX_DIMENSION = 1200
const COMPRESS_THRESHOLD = 1024 * 1024 // 1MB

function uuid(): string {
  if (crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Reescala una imagen a máx 1200px de lado mayor usando canvas.
 * Devuelve un Blob jpeg/png comprimido.
 */
export async function compressImage(file: File): Promise<{ blob: Blob; ext: string }> {
  const needsCompress = file.size > COMPRESS_THRESHOLD
  const isPng = file.type === 'image/png'
  const ext = isPng ? 'png' : 'jpg'

  if (!needsCompress) {
    return { blob: file, ext: file.name.split('.').pop() || ext }
  }

  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const mime = isPng ? 'image/png' : 'image/jpeg'
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('No se pudo comprimir la imagen'))),
      mime,
      0.85,
    ),
  )
  return { blob, ext }
}

export interface UploadResult {
  publicUrl: string
  path: string
}

/**
 * Sube una imagen al bucket público `product-images`.
 * onProgress recibe 'compressing' | 'uploading'.
 */
export async function uploadProductImage(
  file: File,
  onPhase?: (phase: 'compressing' | 'uploading') => void,
): Promise<UploadResult> {
  onPhase?.('compressing')
  const { blob, ext } = await compressImage(file)
  onPhase?.('uploading')
  const path = `${uuid()}.${ext}`
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: blob.type || (ext === 'png' ? 'image/png' : 'image/jpeg'),
    })
  if (error) throw error
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)
  return { publicUrl: data.publicUrl, path }
}
