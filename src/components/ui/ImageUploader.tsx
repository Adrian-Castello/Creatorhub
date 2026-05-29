import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Upload } from 'lucide-react'
import { uploadProductImage } from '../../lib/images'
import { useToast } from '../../hooks/useToast'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
}

export function ImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<null | 'compressing' | 'uploading'>(null)
  const [dragOver, setDragOver] = useState(false)
  const { push } = useToast()

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      push('El archivo no es una imagen', 'error')
      return
    }
    try {
      if (file.size > 1024 * 1024) push('Comprimiendo imagen…', 'info')
      const { publicUrl } = await uploadProductImage(file, setPhase)
      onChange(publicUrl)
      push('Imagen subida', 'success')
    } catch (e: any) {
      push('Error al subir imagen: ' + (e.message ?? ''), 'error')
    } finally {
      setPhase(null)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />
      <div
        onClick={() => !phase && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f) handleFile(f)
        }}
        className={`group relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
          dragOver ? 'border-brand bg-brand/5' : 'hairline hover:border-brand/50'
        }`}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <span className="flex items-center gap-2 text-sm font-medium text-white">
                <Upload size={16} /> Cambiar
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted">
            <ImagePlus size={28} />
            <span className="text-sm">Arrastra o haz clic para subir</span>
          </div>
        )}

        {phase && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/80 dark:bg-d-card/80 backdrop-blur-sm">
            <Loader2 size={24} className="animate-spin text-brand" />
            <span className="text-sm font-medium">
              {phase === 'compressing' ? 'Comprimiendo…' : 'Subiendo…'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
